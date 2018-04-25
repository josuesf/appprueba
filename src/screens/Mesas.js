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
    FlatList,
    Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import WifiManager from 'react-native-wifi-manager'
import Camera from 'react-native-camera'
import { ProgressDialog, Dialog } from 'react-native-simple-dialogs';
import { URL_WS } from '../Constantes'
import store from '../store'
import Mesa from '../components/Mesa'
const { width, height } = Dimensions.get('window')
export default class Mesas extends Component<{}> {
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Mesas',
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            conectando: true,
            mesas: [],
            OrientationStatus: '',
            Height_Layout: '',
            Width_Layout: '',
            cuentas_mesa:[]
        }
    }

    componentWillMount() {
        /*if(store.getState().socket.connected){
            this.BuscarProductos()
        }*/
        //this.BuscarMesas()
    }
    componentDidMount() {
        this.BuscarMesas()
    }
    BuscarMesas = () => {

        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario: store.getState().nombre_usuario
            })
        }
        fetch(URL_WS + '/get_mesas_estado', parametros)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                this.setState({ conectando: false, mesas: data.mesas })
            })
    }
    SeleccionarMesa = (Cod_Mesa, Nom_Mesa, Estado_Mesa) => {
        this.setState({ entrando_mesa: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Mesa: Cod_Mesa
            })
        }
        fetch(URL_WS + '/get_productos_by_mesa', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ entrando_mesa: false })
                store.dispatch({
                    type: 'MESA_SELECCIONADA',
                    Cod_Mesa: Cod_Mesa,
                    Nom_Mesa: Nom_Mesa
                })
                if (data.productos_selec.length > 0) {
                    store.dispatch({
                        type: 'ADD_PRODUCTOS_SELECCIONADOS',
                        productos: data.productos_selec.filter(p => p.Id_Referencia == 0),
                        producto_detalles: data.productos_selec.filter(p => p.Id_Referencia != 0)
                    })
                    pedidos = data.productos_selec
                    this.setState({
                        cuentas_mesa: pedidos.filter((p, i) => {
                            if (i + 1 != pedidos.length) {
                                if (p.Numero != pedidos[i + 1].Numero)
                                    return p
                                else
                                    return null
                            } else
                                return p
                        })
                    },()=>{
                        if(this.state.cuentas_mesa.length==1){
                            store.dispatch({
                                type: 'ADD_NUMERO_COMPROBANTE',
                                Numero_Comprobante: data.productos_selec[0].Numero,
                            })
                            this.props.navigation.navigate('main', { productos_selec: data.productos_selec })
                        }else{
                            this.setState({OpcionesVisible:true})
                        }
                    })
                    
                } else {
                    store.dispatch({
                        type: 'ADD_NUMERO_COMPROBANTE',
                        Numero_Comprobante: '',
                    })
                    this.props.navigation.navigate('main', { productos_selec: data.productos_selec })
                }
            })
    }
    AbrirCuentaMesa(Numero) {
        this.setState({OpcionesVisible:false})
        store.dispatch({
            type: 'ADD_NUMERO_COMPROBANTE',
            Numero_Comprobante: Numero,
        })
        this.props.navigation.navigate('main',{ productos_selec: [] })
    }
    _handleBarCodeRead(e) {
        Vibration.vibrate();
        this.setState({
            scanning: false,
            resultado: e.data,
            conectando: true,
            Cod_Mesa: e.data.split(';')[2]
        }, () => this.BuscarProductos());

    }
    DetectOrientation() {

        if (this.state.Width_Layout > this.state.Height_Layout) {

            // Write Your own code here, which you want to execute on Landscape Mode.
            this.setState({
                OrientationStatus: 'Landscape'
            });
        }
        else {
            // Write Your own code here, which you want to execute on Portrait Mode.
            this.setState({
                OrientationStatus: 'Portrait'
            });
        }

    }
    render() {
        const { navigate } = this.props.navigation;
        const { params } = this.props.navigation.state
        return (
            <View style={styles.container} onLayout={(event) => this.setState({
                Width_Layout: event.nativeEvent.layout.width,
                Height_Layout: event.nativeEvent.layout.height
            }, () => this.DetectOrientation())}>
                <StatusBar
                    backgroundColor="#F9360C"
                    barStyle="default"
                />
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.entrando_mesa}
                    title="Conectando"
                    message="Por favor, espere..."
                />

                <View style={{ padding: 10 }}>
                    <Text style={styles.instructions}>Bienvenido, {store.getState().nombre_usuario}</Text>
                    {this.state.conectando && <ActivityIndicator color='#333' size='large' style={{ alignSelf: 'center', marginVertical: 20 }} />}
                    {/*<View style={styles.rectangleContainer}>
                        <Camera style={styles.camera}
                            type={this.state.cameraType}
                            onBarCodeRead={this._handleBarCodeRead.bind(this)}>
                            <View style={styles.rectangleContainer}>
                                <View style={styles.rectangle} />
                            </View>
                        </Camera>
                    </View> ffb142 ff5252*/}
                    <FlatList
                        style={{ marginBottom: 20 }}
                        data={this.state.mesas}
                        numColumns={4}
                        keyExtractor={(item, index) => index}
                        renderItem={({ item }) => (
                            <Mesa width_state={this.state.Width_Layout} height_state={this.state.Height_Layout} mesa={item}
                                SeleccionarMesa={() => this.SeleccionarMesa(item.Cod_Mesa, item.Nom_Mesa, item.Estado_Mesa)} />
                        )}
                    />

                </View>
                <Dialog
                    visible={this.state.OpcionesVisible}
                    onTouchOutside={() => this.setState({ OpcionesVisible: false })} >
                    <View>
                        {this.state.cuentas_mesa.map((c, i) =>
                            <TouchableOpacity key={i} activeOpacity={0.5} onPress={() => this.AbrirCuentaMesa(c.Numero)}
                                style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                                <Text style={{ fontWeight: 'bold', color: 'gray' }}>Cuenta {c.Numero}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Dialog>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    instructions: {
        color: '#40407a',
        marginVertical: 10,
        fontWeight: 'bold'
    },
    camera: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        height: Dimensions.get('window').width - 100,
        width: Dimensions.get('window').width,
    },
    rectangle: {
        height: 200,
        width: 200,
        borderWidth: 2,
        borderColor: '#33d9b2',
        backgroundColor: 'transparent',
    },
    rectangleContainer: {
        backgroundColor: 'transparent',
    },
});