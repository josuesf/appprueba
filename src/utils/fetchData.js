
import {URL_WS} from '../Constantes'
module.exports = {
    fetchData: (url,method,params, callback) => {
        const parametros = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }
        fetch(URL_WS + url, parametros) //http://192.168.1.5:8000
            .then((response) => response.json())
            .then((responseJson) => {
                if(!responseJson.err){
                    callback(responseJson.respuesta,undefined)
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