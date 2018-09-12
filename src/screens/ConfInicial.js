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
import { ProgressDialog } from 'react-native-simple-dialogs';
import { URL_WS } from '../Constantes'
import { fetchData } from '../utils/fetchData'
import store from '../store'

export default class ConfigInicial extends Component<{}> {
    static navigationOptions = {
        title: "Configuracion Inicial",
        headerTintColor: '#78C8B4',
    };
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

    }
    guardarDatos = () => {
        const { usuario, ruc, host_ip } = this.state
        if (usuario.length > 0 && ruc.length > 0 && host_ip.length > 0) {
            
            AsyncStorage.setItem('DATA_INI', JSON.stringify({
                usuario, ruc, host_ip
            }),(err)=>{
                if(err) return;
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
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>RUC</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.ruc}  
                            onChangeText={(ruc)=>this.setState({ruc})}
                            selectionColor="#96E8C3"
                            keyboardType="numeric"
                            style={styles.boxInput}
                            underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>USUARIO</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.usuario} 
                            onChangeText={(usuario)=>this.setState({usuario})}
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
                            onChangeText={(host_ip)=>this.setState({host_ip})}                           
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