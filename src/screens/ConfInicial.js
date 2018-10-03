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
    ToastAndroid,
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
import { ProgressDialog, Dialog } from 'react-native-simple-dialogs';
import { URL_WS } from '../Constantes'
import { fetchData } from '../utils/fetchData'
import store from '../store'
import { temas } from '../utils/temas'

export default class ConfigInicial extends Component<{}> {
    static navigationOptions = {
        title: "Configuracion Inicial",
        headerTintColor: '#78C8B4',
    };
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            title: 'Configuracion Inicial',
            headerTintColor: params.colorTema,
            headerStyle: {
                backgroundColor: '#FFF',
            },
            headerRight: (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={params.SeleccionTemas} style={{ paddingHorizontal: 10 }}>
                        <IconMaterial color={params.colorTema} name='circle' size={25} />
                    </TouchableOpacity>
                </View>
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
            ruc: '',
            host_ip: ''
        }
    }

    componentWillMount() {
        temas((tema_seleccionado, temas) => {
            this.setState({
                temas,
                tema_seleccionado
            })
            this.props.navigation.setParams({ colorTema: tema_seleccionado.primary })
            global.tema = tema_seleccionado
        })
        // AsyncStorage.removeItem('TEMA_SELEC')
        AsyncStorage.getItem('TEMA_SELEC', (err, tema) => {
            if (!tema || tema == null) {
                AsyncStorage.setItem('TEMAS', JSON.stringify({
                    'tema1': {
                        nombre: 'verde_oscuro',
                        primary: '#66B09E',
                        primaryDark: '#78C8B4'
                    },
                    'tema2': {
                        nombre: 'rojo',
                        primary: '#EF7092',
                        primaryDark: '#BD4B69'
                    },
                }))
                AsyncStorage.setItem('TEMA_SELEC', 'tema1')
            }
        })
        this.props.navigation.setParams({  SeleccionTemas: this.SeleccionTemas });
    }
    SeleccionTemas = () => {
        this.setState({ dialogTemasSeleccion: true })
    }
    GuardarTema = (tema) => {
        this.setState({ dialogTemasSeleccion: false }, () => {
            AsyncStorage.setItem('TEMA_SELEC', tema, (err) => {
                const reset = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'configInicial' })
                    ]
                })
                this.props.navigation.dispatch(reset)
            })
        })

    }
    guardarDatos = () => {
        const { usuario, ruc, host_ip } = this.state
        if (usuario.length > 0 && ruc.length > 0 && host_ip.length > 0) {

            AsyncStorage.setItem('DATA_INI', JSON.stringify({
                usuario, ruc, host_ip
            }), (err) => {
                if (err) return;
                const main = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'patron' })
                    ]
                })
                this.props.navigation.dispatch(main)
            })
        } else
            ToastAndroid.show("Ingrese todos los campos", ToastAndroid.SHORT)
    }
    render() {
        const { navigate } = this.props.navigation;
        const { patron,tema_seleccionado } = this.state
        return (
            <View style={styles.container}>
                <StatusBar
                     backgroundColor={tema_seleccionado ? tema_seleccionado.primaryDark : '#78C8B4'}//global.tema.primaryDark
                    barStyle="default"
                />
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.conectando}
                    title="Conectando"
                    message="Por favor, espere..."
                />
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>RUC</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.ruc}
                            onChangeText={(ruc) => this.setState({ ruc })}
                            selectionColor="#96E8C3"
                            keyboardType="numeric"
                            style={styles.boxInput}
                            underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <Dialog
                    visible={this.state.dialogTemasSeleccion}
                    onTouchOutside={() => this.setState({ dialogTemasSeleccion: false })}>

                    <TouchableOpacity onPress={() => this.GuardarTema('tema1')} style={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <IconMaterial color={'#66B09E'} name='circle' size={40} />
                        <Text style={{ color: '#66B09E', fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>Tema 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.GuardarTema('tema2')} style={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <IconMaterial color={'#EF7092'} name='circle' size={40} />
                        <Text style={{ color: '#EF7092', fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>Tema 2</Text>
                    </TouchableOpacity>

                </Dialog>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>USUARIO</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.usuario}
                            onChangeText={(usuario) => this.setState({ usuario })}
                            selectionColor="#96E8C3"
                            keyboardType="name-phone-pad"
                            style={styles.boxInput}
                            underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>HOST - IP</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.host_ip}
                            onChangeText={(host_ip) => this.setState({ host_ip })}
                            selectionColor="#96E8C3"
                            keyboardType="numeric"
                            style={styles.boxInput}
                            underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <TouchableOpacity onPress={this.guardarDatos}
                    style={[styles.boxRow, { backgroundColor: '#FFF', elevation: 5, marginRight: 10 }]}>
                    <Text style={{ alignSelf: 'center', color: '#FF686B', fontWeight: 'bold', paddingVertical: 5 }}>GUARDAR DATOS</Text>
                </TouchableOpacity>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    boxRow: { backgroundColor: '#FFF', marginLeft: 16, margin: 2, marginTop: 10, paddingVertical: 5, paddingHorizontal: 5 },
    boxTitle: { fontWeight: 'bold', color: '#78C8B4', fontSize: 12 },
    boxBody: { flexDirection: 'row', alignItems: 'center' },
    boxInput: { flex: 1 },

});