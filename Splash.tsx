// Here Is A Sample To Handle Notification That Open App
// You Can Set It In Navigation File Also Before Navigation Container Loaded And Set Initial Route And Inital Params
import notifee from '@notifee/react-native';

const initialNotification: any = await notifee.getInitialNotification()

if(initialNotification && initialNotification?.notification?.data) {
    // Perform Any Action
}
