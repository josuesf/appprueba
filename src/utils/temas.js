import {AsyncStorage} from 'react-native'
module.exports = {
    temas: async (callback) => {
        const TEMA_SELEC = await AsyncStorage.getItem('TEMA_SELEC')
        const TEMAS = JSON.parse(await AsyncStorage.getItem('TEMAS'))
        
        callback(TEMAS[TEMA_SELEC],TEMAS)
        // return TEMAS[TEMA_SELEC]
    }
}