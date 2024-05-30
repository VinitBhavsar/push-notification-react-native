import notifee from '@notifee/react-native';
import NotifService from './NotifService';

let notif: NotifService
export const setupPushNotification = async () => {
    notif = new NotifService(
        onRegister,
        onNotif,
    );
}

const onRegister = (token: any) => {
    console.log("---FCM TOKEN---", token)
}

const onNotif = (notification: any) => {
    console.log("---ON NOTIFICATION---", notification)
        handleNotif(notification)
}

const handleNotif = (notification: any) => {

    const data = notification.data
    if (!notification.userInteraction) {
        if (data) {
            let allowToShow = true
            if (data.send_time) {

                const currentTime = Math.round(new Date().getTime() / 1000)

                const diff = currentTime - data.send_time

                allowToShow = diff < 180
            }

            if (allowToShow) {
                notif.localNotif({
                    importance: "high",
                    message: data.message || data.text || notification?.notification?.body,
                    title: data.title,
                    userInfo: data,
                    soundName: data.sound || "default",
                    id: notification.id
                })

            }
            handlePerm(notification)
        }
    } else {
        // When User Click On Notification
        handleRedirection(notification)
    }
}

const handlePerm = async (notification: any) => {
console.log("---NOTIFICATION RECEIVED---",notification);

    if (notification && notification.data) {
        const { type, data } = notification.data
        switch (type) {
            // Cases Depending On Your Notification Type
        }

    }

}

export const handleRedirection = (notification: any) => {
    console.log("----ON NOTIFICATION CLICK----")
    notifee.getInitialNotification()
    if (notification && notification.data)
    {
        const { type } = notification.data
        const { data } = notification
        switch (type) {
            // Cases Depending On Your Notification Type
        }

    }
    return ""
}


export const sendNotification = async (notification: any) => {
    notif.localNotif(notification)
}

export const clearNotification = async (id: any) => {
    notif.cancelNotif(id)
}

export const createScheduleNotification = async (notification: any) => {
    notif.scheduleNotif(notification)
}