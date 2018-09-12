/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    AsyncStorage,
    StatusBar,
    Text,
    Dimensions,
    Vibration,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationActions } from 'react-navigation'
import WifiManager from 'react-native-wifi-manager'
import Camera from 'react-native-camera'
import { ProgressDialog,ConfirmDialog } from 'react-native-simple-dialogs';
import { URL_WS } from '../Constantes'
import { fetchData } from '../utils/fetchData'
import store from '../store'

export default class Patron extends Component<{}> {
    
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            title: 'Ingrese Pin',
            headerTintColor: '#78C8B4',
            headerStyle: {
                backgroundColor: '#FFF',
            },
            headerRight: (
                <TouchableOpacity onPress={params.CerrarSesion} style={{ paddingHorizontal: 10 }}>
                    <IconMaterial color={'#78C8B4'} name='power' size={25} />
                </TouchableOpacity>
            ),
        }
    }
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            usuario: '',
            password: '',
            cargando: false,
            patron: ''
        }
    }

    componentWillMount() {
        AsyncStorage.getItem('DATA_INI',(err,datos)=>{
            if(datos && datos!=null){
                datos = JSON.parse(datos)
                global.URL_WS = datos.host_ip
            }else{
                const configInicial = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'configInicial' })
                    ]
                })
                this.props.navigation.dispatch(configInicial)
            }
        })
        this.props.navigation.setParams({ CerrarSesion: this.PreguntaCerrarSesion });
    }
    PreguntaCerrarSesion=()=>{
        this.setState({preguntaCerrarSesion:true})
    }
    CerrarSesion=()=>{
        AsyncStorage.removeItem('DATA_INI',(err)=>{
            if(!err){
                const configInicial = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'configInicial' })
                    ]
                })
                this.props.navigation.dispatch(configInicial)
            }
        })
    }
    PressNumero = (Numero) => {
        this.setState(
            { patron: this.state.patron + Numero }
            , () => {
                if (this.state.patron.length == 4) {
                    fetchData('/verificar_pin', 'POST',
                        {
                            pin: this.state.patron
                        }
                        , (data, err) => {
                            if (err){
                                setTimeout(() => {
                                    this.setState({ patron: '' })
                                }, 1000)
                                Alert.alert('Error', err.toString()+"\nVerifique su configuracion de conexion.\nVerifique el estado del programa controlador.")
                            }
                            else {
                                if (data.respuesta.length > 0) {
                                    store.dispatch({
                                        type: 'LOGIN_USUARIO',
                                        id_usuario: data.respuesta[0].Cod_Usuarios,
                                        nombre_usuario: data.respuesta[0].Nick,
                                        tipo_usuario: 'EMPLEADO'
                                    })
                                    const vista_mesas = NavigationActions.reset({
                                        index: 0,
                                        actions: [
                                            NavigationActions.navigate({ routeName: 'mesas' })
                                        ]
                                    })
                                    this.props.navigation.dispatch(vista_mesas)

                                } else {
                                    setTimeout(() => {
                                        this.setState({ patron: '' })
                                    }, 1000)
                                    Alert.alert('Error', 'Pin Incorrecto, vuelva a intentarlo')

                                }
                            }
                        })
                   

                }
            })
    }
    render() {
        const { navigate } = this.props.navigation;
        const { patron } = this.state
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#78C8B4"
                    barStyle="default"
                />
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.conectando}
                    title="Conectando"
                    message="Por favor, espere..."
                />
                  <ConfirmDialog
                    title="Cerrar Sesion"
                    message="Se perdera todos los datos de configuracion,esta seguro de cerrar sesion?"
                    visible={this.state.preguntaCerrarSesion}
                    onTouchOutside={() => this.setState({ preguntaCerrarSesion: false })}
                    positiveButton={{
                        title: "SI",
                        onPress: () => this.CerrarSesion()
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => this.setState({ preguntaCerrarSesion: false })
                    }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                    <IconMaterial style={{ marginRight: 10 }}
                        name={patron.length > 0 ? "circle" : "circle-outline"} size={20} color="#FFA69E" />
                    <IconMaterial style={{ marginRight: 10 }}
                        name={patron.length > 1 ? "circle" : "circle-outline"} size={20} color="#FFA69E" />
                    <IconMaterial style={{ marginRight: 10 }}
                        name={patron.length > 2 ? "circle" : "circle-outline"} size={20} color="#FFA69E" />
                    <IconMaterial style={{ marginRight: 10 }}
                        name={patron.length > 3 ? "circle" : "circle-outline"} size={20} color="#FFA69E" />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, marginHorizontal: 20 }}>
                    <TouchableOpacity onPress={() => this.PressNumero(1)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(2)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(3)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>3</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, marginHorizontal: 20 }}>
                <TouchableOpacity onPress={() => this.PressNumero(4)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(5)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(6)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>6</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, marginHorizontal: 20 }}>
                <TouchableOpacity onPress={() => this.PressNumero(7)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>7</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(8)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>8</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.PressNumero(9)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>9</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, marginHorizontal: 20 }}>
                <TouchableOpacity
                        onPress={() => this.PressNumero(0)}
                        activeOpacity={0.7} style={styles.btnNumero}>
                        <Text style={styles.btnTextNumero}>0</Text>
                    </TouchableOpacity>
                </View>


            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    btnNumero: {
        backgroundColor: '#78C8B4', marginHorizontal: 30,
        width: 70, height: 70, justifyContent: 'center',
        borderRadius: 35
    },
    btnTextNumero: { fontWeight: 'bold', color: '#FFF', fontSize: 20, alignSelf: 'center' }

});