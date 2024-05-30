import notifee, { AndroidImportance, AndroidStyle, EventType, NotificationIOS } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import { handleRedirection } from './NotificationHandler';

export default class NotifService {
    lastId = 0;
    lastChannelCounter = 0;
    constructor(onRegister: any, onNotification: any) {
        this.lastId = 0;
        this.lastChannelCounter = 0;
        messaging().registerDeviceForRemoteMessages()

        if (Platform.OS == "ios")
            messaging().requestPermission().then((res: any) => {
                if (res === messaging.AuthorizationStatus.AUTHORIZED ||
                    res === messaging.AuthorizationStatus.PROVISIONAL
                ) {
                    messaging().getToken().then((token) => {
                        console.log("---GET FCM TOKEN---", token)
                        onRegister({ token })
                    }).catch((e) => {
                        console.log("getTokenError", e);
                    })
                }
            })
        else {
            if (+Platform.Version >= 33) {
                check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then((check) => {
                    if (check == "denied") {
                        request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then((result: any) => {
                            console.log("PERMISSION RESULT", result)
                        })
                    }
                }).catch((error) => {
                    console.log("PERMISSION ERROR", error)
                })
            }
            messaging().getToken().then((token) => {
                console.log("---GET FCM TOKEN---", token)
                onRegister({ token })
            }).catch((e) => {
                console.log("getTokenError", e);
            })
        }

        messaging().onTokenRefresh((token) => {

            console.log("onTokenRefresh", token)
            onRegister({ token })
        })

        messaging().onMessage((message) => {
            console.log("----onMessage----", message)
            onNotification(message)
        })

        messaging().setBackgroundMessageHandler(async (message) => {
            console.log("----setBackgroundMessageHandler----", message)
            onNotification(message)
        })

        notifee.onForegroundEvent(({ type, detail }) => {
            console.log("---FORGROUND NOTIFICATION---", type, detail)
            switch (type) {
                case EventType.DISMISSED:
                    console.log('User dismissed notification', detail.notification);
                    break;
                case EventType.PRESS:
                    console.log('User pressed notification', detail.notification);
                    handleRedirection(detail.notification)
                    break;
            }
        });

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            const { notification, pressAction } = detail;
            console.log("---BACKGROUND NOTIFICATION---", type, notification, pressAction);
            if (type == EventType.PRESS) {
                handleRedirection(notification)
                notifee.cancelAllNotifications()
            }
        });

        // Clear badge number at start
        notifee.getBadgeCount().then((number: any) => {
            if (number > 0) {
                notifee.setBadgeCount(0)
            }
        })

        notifee.getChannels().then((channels: any) => {
            console.log(channels);
        })

        this.createOrUpdateChannel()
    }

    createOrUpdateChannel() {
        this.lastChannelCounter++;

        notifee.createChannel({
            id: "102",
            name: `Notifications`, // (required)
            description: `Notifications`, // (optional) default: undefined.
            sound: "default",
            importance: AndroidImportance.HIGH,
            vibration: true
        }).then((created: any) => {
            console.log(`createChannel returned '${created}'`)
        })

    }

    popInitialNotification() {
        notifee.getInitialNotification().then((notification: any) => console.log('InitialNotication:', notification))
    }

    localNotif(notification: any) {
        console.log("----LOCAL NOTIFICATION---")
        let ios_sound = notification?.userInfo?.image ? {
            foregroundPresentationOptions: {
                banner: true,
                list: true,
                sound: true,
                badge: true
            },
            critical: true,
            attachments: [{ url: notification?.userInfo?.image }]
        } : {}
        let ios_details: NotificationIOS = notification?.soundName ? { sound: notification?.soundName, ...ios_sound } :
            notification?.userInfo?.image ?
                {
                    foregroundPresentationOptions: {
                        banner: true,
                        list: true,
                        sound: true,
                        badge: true
                    },
                    critical: true,
                    attachments: [{ url: notification?.userInfo?.image }]
                } : {}
        this.lastId++;

        notifee.displayNotification({
            id: notification.id ? notification.id : "123",
            title: notification.title ? notification.title, // (optional)
            body: notification.message,
            data: notification.data || notification.userInfo || {},
            android: {
                channelId: notification.channelId || "102",
                smallIcon: '@drawable/ic_notification_icon',
                importance: notification?.userInfo?.image ? AndroidImportance.DEFAULT : AndroidImportance.HIGH,
                style: notification?.userInfo?.image ? {
                    type: AndroidStyle.BIGPICTURE,
                    picture: notification?.userInfo?.image,
                } : {
                    type: AndroidStyle.BIGTEXT,
                    text: notification.message
                },
                pressAction: {
                    id: 'default'
                }
            },
            ios: ios_details
        })
    }

    scheduleNotif(notification: any) {
        console.log("---SCHEDULE NOTIFICATION---", notification)
    }

    async cancelNotif(id: any) {
        notifee.cancelNotification(id)
    }

    async cancelAll() {
        await notifee.cancelAllNotifications()
    }

}