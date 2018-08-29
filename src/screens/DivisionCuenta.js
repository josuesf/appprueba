/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    AsyncStorage,
    Dimensions,
    StatusBar,
    Platform,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ToastAndroid
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { URL_WS } from '../Constantes'
import store from '../store'
import { Dialog, ProgressDialog } from 'react-native-simple-dialogs';
import ProductoDivision from '../components/ProductoDivision';
export default class DivisionCuenta extends Component {

    //Personalizacion de Toolbar
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            title: 'Division Cuenta',
            headerTintColor: '#ffeaa7',
            headerBackTitle: 'Atras',
            headerStyle: {
                backgroundColor: '#FF5733',
            },
            headerRight: (
                store.getState().tipo_usuario == 'EMPLEADO' &&
                <TouchableOpacity onPress={params.AbrirOpciones} style={{ paddingHorizontal: 10 }}>
                    <IconMaterial color={'#ffeaa7'} name='dots-vertical' size={25} />
                </TouchableOpacity>
            ),
        }
    }
    //Variables e inicio de estado
    constructor(props) {
        super(props)
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            productos: store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa && p.Numero == store.getState().Numero_Comprobante).slice(0),
            total: 0,
            cuenta_principal: store.getState().Numero_Comprobante,
            Nom_Cliente: '',
            cuentas: [],
            productos_cuenta: [],
            nro_cuenta_actual: 2,
        }
    }
    componentWillMount() {
        
        this.setState({
            cantidad_restante:this.state.productos.reduce((a, b) => a + b.Cantidad, 0)
        })
        //Personalizacion de Accion boton superior derecho
        this.props.navigation.setParams({ AbrirOpciones: this._AbrirOpciones });
    }
    _AbrirOpciones = () => {
        this.setState({ OpcionesVisible: true })
    }
    componentDidMount() {
        this.CalcularTotal(this.state.productos)
    }
    CalcularTotal = (productos) => {
        //Total de consumo S/.
        this.setState({ total: productos.reduce((a, b) => a + (b.Estado_Pedido != 'CONFIRMA' ? b.PrecioUnitario * b.Cantidad : 0), 0) })
    }
    agregar = (producto, cantidad_seleccionada) => {
        //console.log(producto)
        if (!this.state.productos_cuenta.find(p => p.Id_Producto == producto.Id_Producto)) {
            let producto_new = {
                Id_Producto: producto.Id_Producto,
                Id_Detalle: producto.Id_Detalle,
                Id_Referencia: producto.Id_Referencia,
                Numero: this.state.nro_cuenta_actual,
                Cod_TipoOperatividad: producto.Cod_TipoOperatividad,
                Cod_Almacen: producto.Cod_Almacen,
                Nom_Producto: producto.Nom_Producto,
                Cantidad: cantidad_seleccionada,
                Cod_Mesa: producto.Cod_Mesa,
                PrecioUnitario: producto.PrecioUnitario,
                Estado_Pedido: producto.Estado_Pedido
            }
            this.setState({
                productos_cuenta: this.state.productos_cuenta.concat(producto_new)
            })

        } else {
            this.state.productos_cuenta.filter(p => {
                if (p.Id_Producto == producto.Id_Producto) {
                    p.Cantidad = cantidad_seleccionada
                }
                return p
            })
        }
    }
    quitar = (producto, cantidad_seleccionada) => {
        this.setState({
            productos_cuenta: this.state.productos_cuenta.filter(p => {
                if (p.Id_Producto == producto.Id_Producto) {
                    if (p.Cantidad > 1) {
                        p.Cantidad = p.Cantidad - 1
                        return p
                    } else {
                        return null
                    }
                } else
                    return p
            })
        })
    }
    dividir = () => {
        let prod_ = this.state.productos.reduce((a, b) => a + b.Cantidad, 0)
        let prod_a_dividir = this.state.productos_cuenta.reduce((a, b) => a + b.Cantidad, 0)
        
        if (prod_ - prod_a_dividir > 0){
            this.state.productos_cuenta.forEach(p=>{

            })
            this.setState({
                productos:this.state.productos.filter(p=>{p.cantidad_seleccionada=0; return p}),
                cuentas: this.state.cuentas.concat(this.state.nro_cuenta_actual),
                nro_cuenta_actual: this.state.nro_cuenta_actual + 1
            })
        }else
            ToastAndroid.showWithGravity(
                'All Your Base Are Belong To Us',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View ref='ref_pedido' style={styles.container}>
                <View style={{ backgroundColor: '#eee', margin: 10, elevation: 5, justifyContent: 'center' }}>
                    <Text style={{ color: '#333', paddingVertical: 5, fontWeight: 'bold', marginHorizontal: 15 }}>Cuenta 1</Text>
                    <FlatList
                        data={this.state.productos}
                        renderItem={({ item }) => (
                            <ProductoDivision  producto={item} navigate={navigate} divisible={true} agregar={this.agregar} quitar={this.quitar} />
                        )}
                        keyExtractor={(item, index) => index}
                    />
                    <TouchableOpacity activeOpacity={0.5} onPress={this.dividir}
                        style={{
                            height: 50, borderRadius: 5, marginHorizontal: 10,
                            marginVertical: 10, backgroundColor: '#00b894', justifyContent: 'center'
                        }}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>
                            SEPARAR</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView>

                    {this.state.cuentas.map((c, i) =>
                        <View key={i} style={{ backgroundColor: '#eee' }}>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ color: '#333', paddingVertical: 5, fontWeight: 'bold', marginHorizontal: 15 }}>Cuenta {c}</Text>
                            </View>
                            <FlatList
                                data={this.state.productos_cuenta.filter(p => p.Numero == c)}
                                renderItem={({ item }) => (
                                    <ProductoDivision producto={item} navigate={navigate} divisible={false} />
                                )}
                                keyExtractor={(item, index) => index}
                            />
                        </View>
                    )}


                </ScrollView>



                {store.getState().tipo_usuario == 'EMPLEADO'
                    && this.state.productos.filter(p => p.Estado_Pedido != 'CONFIRMA').length > 0 &&
                    <TouchableOpacity activeOpacity={0.5} onPress={this.ConfirmarPedido}
                        style={{ height: 50, borderRadius: 5, marginHorizontal: 10, marginVertical: 10, backgroundColor: '#ff7675', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>CONFIRMAR PEDIDO {/*'S/.'+this.state.total.toFixed(2)*/}</Text>
                    </TouchableOpacity>}
                {this.state.Mostrar_Total && <View activeOpacity={0.5} onPress={this.HacerPedido}
                    style={{ height: 50, borderRadius: 5, marginHorizontal: 10, marginVertical: 10, backgroundColor: '#fff', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: 'gray', alignSelf: 'center' }}>TOTAL PEDIDO S/.{this.state.productos.reduce((a, b) => a + (b.PrecioUnitario * b.Cantidad), 0).toFixed(2)}</Text>
                </View>}
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.cargando}
                    title="Cargando"
                    message="Por favor, espere..."
                />
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