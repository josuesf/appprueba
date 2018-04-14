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
    Dimensions,
    StatusBar,
    Platform,
    Text,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
const { width, height } = Dimensions.get('window')
import ProductoSeleccionado from '../components/ProductoSeleccionado'
import { URL_WS } from '../Constantes'
import store from '../store'

export default class Pedido extends Component<{}> {
    static navigationOptions = {
        title: 'Pedidos',
        headerTintColor: 'purple',
        header: null,
        tabBarLabel: Platform.OS == 'android' ? ({ tintColor, focused }) => (
            <Text style={{ fontSize: 10, color: focused ? tintColor : '#95a5a6' }}>
                MI ORDEN
            </Text>
        ) : "MI ORDEN",
        tabBarIcon: ({ tintColor, focused }) => (
            <IconMaterial
                name={focused ? 'clipboard-text' : 'clipboard-text'}
                size={25}
                color={focused ? tintColor : '#95a5a6'}
            />
        ),
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            productos: store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa),
            total:0,
            Numero_Comprobante:store.getState().Numero_Comprobante,
            Nom_Cliente:''
        }
    }
    componentWillMount() {
        console.log(store.getState().Numero_Comprobante)
    }
    componentDidMount() {
        this.CalcularTotal(this.state.productos)
        store.subscribe(() => {
            if (this.refs.ref_pedido) {
                
                this.setState({
                    productos: []
                }, () => {
                    
                    productos = store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa)
                    this.setState({ productos: productos  })
                    this.CalcularTotal(productos)
                    console.log(productos)
                })
            }
        })
    }
    HacerPedido = () => {
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Mesa: store.getState().Cod_Mesa,
                Productos: this.state.productos,
                Cod_Moneda : this.state.productos[0].Cod_Moneda,
                Numero:this.state.Numero_Comprobante,
                Nom_Cliente : this.state.Nom_Cliente,
                Total : this.state.total,
                Cod_Vendedor: store.getState().id_usuario,
                Estado_Mesa : 'OCUPADO'
            })
        }
        fetch(URL_WS + '/hacer_pedido_sql', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == 'ok') {
                    this.setState({Numero_Comprobante:data.Numero})
                    //Guardar Numero
                    Alert.alert('Gracias!', 'Tu pedido esta en cola')
                } else {
                    Alert.alert('Sucedio algo!', 'Vuelve a intentarlo o nuestro vendra a ayudarlo')
                }
            })
    }
    ConfirmarPedido = () => {
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Mesa: store.getState().Cod_Mesa,
                productos: this.state.productos
            })
        }
        fetch(URL_WS + '/confirmar_pedido', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.resultado == 'ok') {
                    Alert.alert('Gracias!', 'Tu pedido esta siendo atendido')
                } else {
                    Alert.alert('Sucedio algo!', 'Vuelve a intentarlo o nuestro vendra a ayudarlo')
                }
            })
    }
    CalcularTotal=(productos)=>{
        this.setState({total:productos.reduce((a, b) => a + (b.PrecioUnitario*b.Cantidad), 0)})
        
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View ref='ref_pedido' style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <View style={{height:50,backgroundColor:'#40407a',justifyContent:'center'}}>
                    <Text style={{fontSize:20,color:'#ffeaa7',fontWeight:'bold',alignSelf:'center'}}>{store.getState().Nom_Mesa}</Text>
                </View>
                <FlatList
                    data={this.state.productos}
                    renderItem={({ item }) => (
                        <ProductoSeleccionado producto={item} navigate={navigate} />
                    )}
                    keyExtractor={(item, index) => index}
                />
                {store.getState().tipo_usuario=='PUBLICO' && this.state.productos.length>0 &&
                <TouchableOpacity activeOpacity={0.5} onPress={this.HacerPedido}
                    style={{ height: 50, backgroundColor: '#00b894', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>HACER PEDIDO</Text>
                </TouchableOpacity>}
                {store.getState().tipo_usuario=='EMPLEADO' && this.state.productos.length>0 &&
                <TouchableOpacity activeOpacity={0.5} onPress={this.HacerPedido}
                    style={{ height: 50, backgroundColor: '#ff7675', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>CONFIRMAR PEDIDO S/.{this.state.total.toFixed(2)}</Text>
                </TouchableOpacity>}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
});