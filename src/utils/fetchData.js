
//import {URL_WS} from '../Constantes'
import {AsyncStorage} from 'react-native'
module.exports = {
    fetchData: async (url,method,params, callback) => {
        const parametros = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }
        const HOST = JSON.parse(await AsyncStorage.getItem('DATA_INI')).host_ip
        fetch(HOST + url, parametros) //http://192.168.1.5:8000
            .then((response) => response.json())
            .then((responseJson) => {
                //console.log(responseJson)
                if(!responseJson.err){
                    callback(responseJson,undefined)
                }else{
                    callback(undefined,responseJson.err)
                }
                
            })
            .catch(err => {
                console.log(err)
                callback(undefined,err)
            })
    },
}
