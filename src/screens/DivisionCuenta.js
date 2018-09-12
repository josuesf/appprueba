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
import { NavigationActions } from 'react-navigation'
import { URL_WS } from '../Constantes'
import store from '../store'
import { ConfirmDialog, ProgressDialog } from 'react-native-simple-dialogs';
import ProductoDivision from '../components/ProductoDivision';
import { fetchData } from '../utils/fetchData'

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
                <TouchableOpacity onPress={params.guardar} style={{ paddingHorizontal: 10 }}>
                    <Text style={{ color: '#ffeaa7', fontWeight: 'bold' }}>Guardar</Text>
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
            productos: [],
            total: 0,
            cuenta_principal: store.getState().Numero_Comprobante,
            Nom_Cliente: '',
            cuentas: [],
            productos_cuenta: [],
            nro_cuenta_actual: Date.now(),
        }
    }
    componentWillMount() {
        this.SeleccionarMesa(store.getState().Cod_Mesa, store.getState().Numero_Comprobante)
        //Personalizacion de Accion boton superior derecho
        this.props.navigation.setParams({ guardar: this.GuardarDivision });
    }
    SeleccionarMesa = (Cod_Mesa, Numero) => {

        fetchData('/get_productos_by_mesa', 'POST', { Cod_Mesa }, (data, err) => {
            //console.log(data.productos_selec)
            this.setState({
                productos: data.productos_selec.filter(p => {
                    if (p.Numero == Numero && p.Id_Referencia == 0) {
                        p.cantidad_seleccionada = 0
                        return p
                    } else
                        return null
                })
            })
        })
    }
    GuardarDivision = () => {
        this.DividirPedido()
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
        if (!this.state.productos_cuenta.find(p => p.Id_Detalle == producto.Id_Detalle && p.Numero == this.state.nro_cuenta_actual)) {

            let producto_new = {
                Id_Producto: producto.Id_Producto,
                Id_Detalle: producto.Id_Detalle,
                Id_Referencia: producto.Id_Referencia,
                Numero: this.state.nro_cuenta_actual,
                Cod_TipoOperatividad: producto.Cod_TipoOperatividad,
                Cod_Almacen: producto.Cod_Almacen,
                Nom_Producto: producto.Nom_Producto,
                Cantidad: 1,
                Cod_Mesa: producto.Cod_Mesa,
                PrecioUnitario: producto.PrecioUnitario,
                Estado_Pedido: producto.Estado_Pedido
            }
            this.setState({
                productos: this.state.productos.filter(p => {
                    if (p.Id_Detalle == producto.Id_Detalle) {
                        p.Cantidad = p.Cantidad - 1
                        p.cantidad_seleccionada = p.cantidad_seleccionada + 1
                    }
                    return p
                }),
                productos_cuenta: this.state.productos_cuenta.concat(producto_new)
            })

        } else {

            this.setState({
                productos: this.state.productos.filter(p => {
                    if (p.Id_Detalle == producto.Id_Detalle) {
                        p.Cantidad = p.Cantidad - 1
                        p.cantidad_seleccionada = p.cantidad_seleccionada + 1
                    }
                    return p
                }),
                productos_cuenta: this.state.productos_cuenta.filter(p => {
                    if (p.Id_Producto == producto.Id_Producto && p.Numero == this.state.nro_cuenta_actual) {
                        p.Cantidad = p.Cantidad + 1
                    }
                    return p
                })
            })
        }
    }
    quitar = (producto, cantidad_seleccionada) => {
        this.setState({
            productos_cuenta: this.state.productos_cuenta.filter(p => {
                if (p.Id_Detalle == producto.Id_Detalle && p.Numero == this.state.nro_cuenta_actual) {
                    if (p.Cantidad > 1) {
                        p.Cantidad = p.Cantidad - 1
                        return p
                    } else {
                        return null
                    }
                } else
                    return p
            }),
            productos: this.state.productos.filter(p => {
                if (p.Id_Detalle == producto.Id_Detalle) {
                    p.Cantidad = p.Cantidad + 1
                    p.cantidad_seleccionada = p.cantidad_seleccionada - 1
                }
                return p
            }),
        })
    }
    dividir = () => {
        let prod_ = this.state.productos.reduce((a, b) => a + b.Cantidad, 0)
        let prod_a_dividir = this.state.productos_cuenta.filter(p => p.Numero == this.state.nro_cuenta_actual).length

        if (prod_ > 0 && prod_a_dividir > 0) {
            this.setState({
                productos: this.state.productos.filter(p => {
                    if (p.Cantidad > 0) {
                        p.cantidad_seleccionada = 0
                        return p
                    } else
                        return null
                }),
                cuentas: this.state.cuentas.concat(this.state.nro_cuenta_actual),
                nro_cuenta_actual: Date.now()
            })
        } else
            ToastAndroid.showWithGravity(
                'La cuenta es indivisible',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
    }
    DeshacerCuenta = () => {
        let { cuentaEliminar, productos_cuenta, productos } = this.state
        // productos_cuenta = productos_cuenta.filter(p => p.Numero == cuentaEliminar)
        this.setState({
            productos_cuenta: productos_cuenta.filter(p => {
                if (p.Numero == cuentaEliminar) {
                    this.integrar(p)
                    return null
                } else {
                    return p
                }
            }),
            cuentas: this.state.cuentas.filter(c => c != cuentaEliminar),
            preguntaEliminar: false
        })
    }
    integrar = (p) => {
        let { productos } = this.state
        if (productos.find(pc => pc.Id_Detalle == p.Id_Detalle)) {
            this.setState({
                productos: this.state.productos.filter(pro => {
                    if (pro.Id_Detalle == p.Id_Detalle) {
                        pro.Cantidad = pro.Cantidad + p.Cantidad
                        pro.cantidad_seleccionada = 0
                    }
                })
            })
        } else {
            p.Numero = this.state.cuenta_principal
            p.cantidad_seleccionada = 0
            this.setState({
                productos: this.state.productos.concat(p)
            })
        }
    }
    DividirPedido = () => {
        this.setState({ cargando: true })
        Productos_Detalles = store.getState().producto_detalles.filter(p => (p.Cod_Mesa == store.getState().Cod_Mesa && p.Estado_Pedido == 'CONFIRMA'))
        console.log(this.state.productos.concat(this.state.productos_cuenta))
        console.log(Productos_Detalles)
        fetchData('/dividir_cuenta', 'POST', {
            Cod_Mesa: store.getState().Cod_Mesa,
            Productos: this.state.productos.concat(this.state.productos_cuenta),
            Productos_Detalles,
            Cod_Moneda: 'PEN',//this.state.productos[0].Cod_Moneda,
            Numero: this.state.cuenta_principal,
            Nom_Cliente: "CLIENTES VARIOS",
            Total: 0,//this.state.productos.reduce((a, b) => a + (b.PrecioUnitario * b.Cantidad), 0),
            Cod_Vendedor: store.getState().id_usuario,
            Estado_Mesa: 'OCUPADO',
        }, (data, err) => {
            this.setState({ cargando: false })
            if (data.respuesta == 'ok') {
                //Guardar Numero
                // Alert.alert('Gracias!', 'Tu pedido esta en cola')
                const vista_mesas = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'mesas' })
                    ]
                })
                this.props.navigation.dispatch(vista_mesas)
            } else {
                Alert.alert('Sucedio algo!', 'Vuelve a intentarlo o nuestro vendra a ayudarlo')
            }
        })
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
                            <ProductoDivision producto={item} navigate={navigate} divisible={true} agregar={this.agregar} quitar={this.quitar} />
                        )}
                        keyExtractor={(item, index) => index}
                    />
                    {this.state.productos_cuenta.filter(p => p.Numero == this.state.nro_cuenta_actual).length > 0 && <TouchableOpacity activeOpacity={0.5} onPress={this.dividir} //
                        style={{
                            height: 50, borderRadius: 5, marginHorizontal: 10,
                            marginVertical: 10, backgroundColor: '#00b894', justifyContent: 'center'
                        }}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>
                            SEPARAR</Text>
                    </TouchableOpacity>}
                </View>
                <ScrollView>

                    {this.state.cuentas.map((c, i) =>
                        <TouchableOpacity activeOpacity={0.8}
                            //onLongPress={() => this.setState({ preguntaEliminar: true, cuentaEliminar: c })} 
                            key={i}
                            style={{ backgroundColor: '#eee' }}>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ color: '#333', paddingVertical: 5, fontWeight: 'bold', marginHorizontal: 15 }}>Cuenta {i + 2}</Text>

                            </View>
                            <FlatList
                                data={this.state.productos_cuenta.filter(p => p.Numero == c)}
                                renderItem={({ item }) => (
                                    <ProductoDivision producto={item} navigate={navigate} divisible={false} />
                                )}
                                keyExtractor={(item, index) => index}
                            />
                        </TouchableOpacity>
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
                <ConfirmDialog
                    title="Deshacer cuenta"
                    message="Esta seguro de deshacer esta cuenta?"
                    visible={this.state.preguntaEliminar}
                    onTouchOutside={() => this.setState({ preguntaEliminar: false })}
                    positiveButton={{
                        title: "SI",
                        onPress: () => this.DeshacerCuenta()
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => this.setState({ preguntaEliminar: false })
                    }}
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