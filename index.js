import { AppRegistry } from 'react-native';
import App from './App';
// import store from './src/store'
// import BackgroundJob from 'react-native-background-job';
// BackgroundJob.register({
//     jobKey: "everRunningJobKey",
//     job: () => {
//         console.log(`Ever Running Job fired! Key=everRunningJobKey`)
//         // subscribeToTimer((err, timestamp) => console.log(err,timestamp));
//         fetch('http://192.168.1.6:5000/')
//             .then( response=>response.json())
//             .then(function (data) {
//                 console.log(data)
//             });
//     }
// });
// BackgroundJob.schedule({
//     jobKey: "everRunningJobKey",
//     exact: true,
//     period: 5000,
// });
AppRegistry.registerComponent('MiskyApp', () => App);
