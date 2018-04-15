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
import { NavigationActions } from 'react-navigation'
import WifiManager from 'react-native-wifi-manager'
import Camera from 'react-native-camera'
import { ProgressDialog } from 'react-native-simple-dialogs';
import { URL_WS } from '../Constantes'
import store from '../store'

export default class Login extends Component<{}> {
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Login',
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            usuario: '',
            password: '',
            cargando: false,
            
        }
    }

    componentWillMount() {
        if (store.getState().tipo_usuario == 'EMPLEADO' && store.getState().id_usuario) {
            const vista_mesas = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'mesas' })
                ]
            })
            this.props.navigation.dispatch(vista_mesas)
        }
    }

    IniciarSesion = () => {
        this.setState({ cargando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario: this.state.usuario,
                password: this.state.password
            })
        }
        fetch(URL_WS + '/login_personal', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ cargando: false })
                if (data.respuesta == 'ok') {
                    store.dispatch({
                        type: 'LOGIN_USUARIO',
                        id_usuario: data.usuario.Cod_Usuarios,
                        nombre_usuario: data.usuario.Nick,
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
                    Alert.alert('Error', 'Ocurrio un error vuelva a intentarlo')

                }

            }).catch(err => {
                this.setState({ cargando: false })
                Alert.alert('Error', err.toString())
            })
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#F9360C"
                    barStyle="default"
                />
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.conectando}
                    title="Conectando"
                    message="Por favor, espere..."
                />
                <View style={{ marginTop: 20 }}>
                    <Image source={require('../images/logomisky.png')} style={{height:100,width:100,alignSelf:'center'}} />
                </View>
                <View style={{ padding: 10 }}>
                    <Text style={styles.instructions}>Usuario</Text>
                    <View style={{ height: 50, backgroundColor: '#ffeaa7', borderRadius: 5, justifyContent: 'center' }}>
                        <TextInput onChangeText={(text) => this.setState({ usuario: text })} autoCapitalize={'none'} underlineColorAndroid='transparent' style={{ padding: 0, marginHorizontal: 10, fontSize: 15 }} />
                    </View>
                </View>
                <View style={{ padding: 10, paddingTop: 0 }}>
                    <Text style={styles.instructions}>
                        Contraseña
                    </Text>
                    <View style={{ height: 50, backgroundColor: '#ffeaa7', borderRadius: 10, justifyContent: 'center' }}>
                        <TextInput onChangeText={(text) => this.setState({ password: text })} autoCapitalize={'none'} underlineColorAndroid='transparent' secureTextEntry={true} style={{ padding: 0, marginHorizontal: 10, fontSize: 15 }} />
                    </View>
                </View>

                {!this.state.cargando && <View style={{ marginVertical: 25, marginHorizontal: 10 }}>
                    <TouchableOpacity onPress={this.IniciarSesion}
                        activeOpacity={0.7}
                        style={{
                            height: 50, backgroundColor: '#F99F0C', borderRadius: 10, justifyContent: 'center'
                        }} >
                        <Text style={{ color: '#FFF', alignSelf: 'center', fontSize: 18, fontWeight: 'bold' }}>Iniciar Sesion</Text>
                    </TouchableOpacity>
                </View>}
                {this.state.cargando &&
                    <View style={{ marginVertical: 25, marginHorizontal: 10 }}>
                        <ActivityIndicator size='large' color='#ffeaa7' />
                    </View>}
                
            </View>
        );
    }
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    camera: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        height: Dimensions.get('window').width - 100,
        width: Dimensions.get('window').width,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        color: '#ef6d13',
        marginVertical: 10,
        fontSize: 18,
        fontWeight: 'bold'
    },
    rectangleContainer: {
        backgroundColor: 'transparent',
    },

    rectangle: {
        height: 200,
        width: 200,
        borderWidth: 2,
        borderColor: '#33d9b2',
        backgroundColor: 'transparent',
    },
});