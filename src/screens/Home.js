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
    Dimensions,
    Platform, Text,
    FlatList,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
import { Dialog, ProgressDialog } from 'react-native-simple-dialogs';
import Producto from '../components/Producto'
import store from '../store'
import { URL_WS } from '../Constantes'
import { fetchData } from '../utils/fetchData'
const { width, height } = Dimensions.get('window')

export default class Home extends Component<{}> {
    static navigationOptions = {
        title: 'Productos',
        headerTintColor: '#55efc4',
        headerBackTitle: 'Atras',
        headerStyle: {
            backgroundColor: '#40407a',
        },
        header: null
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            categorias_padre: [],
            categorias: [],
            cantidad_items: 0,
            productos_todos: []
        }
    }
    componentWillMount() {
        this.RecuperarCategorias_Todas()
        this.RecuperarProductos_Todos()
        this.CalcularTotal()
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.pedidos_ref)
                this.CalcularTotal()
        })
        if(this.props.navigation.state.params.IdComprobanteOrigen){
            this.props.navigation.navigate('pedido',{ IdComprobanteOrigen: this.props.navigation.state.params.IdComprobanteOrigen })
        }
    }
    CalcularTotal = () => {
        productos = store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa && p.Numero == store.getState().Numero_Comprobante)
        this.setState({
            total: productos.reduce((a, b) => a + (b.PrecioUnitario * b.Cantidad), 0),
            cantidad_items: productos.reduce((a, b) => a + (b.Cantidad), 0),
        })

    }
    RecuperarCategoriasPadre = () => {
        fetchData('/get_categorias_padre', 'POST', {}, (data, err) => {
            categorias = data.categorias.filter((c, index) => {
                if (index == 0)
                    c["Seleccionado"] = 1
                else
                    c["Seleccionado"] = 0
                return c
            })
            this.setState({
                categorias_padre: categorias
            }, () => {
                this.RecuperarCategoriasHijas(data.categorias[0].Cod_Categoria)
            })
        })
    }
    RecuperarCategoriasHijas = (cod_categoria_padre) => {
        this.setState({ productos: [] })
        fetchData('/get_categorias_hijas', 'POST', {
            Cod_Categoria: cod_categoria_padre
        }, (data, err) => {
            categorias = data.categorias.filter((c, index) => {
                c["Seleccionado"] = 0
                return c
            })
            this.setState({
                categorias: categorias
            })
        })
    }
    SeleccionarCategoriaPadre = (Cod_Categoria) => {
        this.RecuperarCategoriasHijas(Cod_Categoria)
        var categorias = this.state.categorias_padre.filter(c => {
            if (c.Cod_Categoria == Cod_Categoria)
                c["Seleccionado"] = 1
            else
                c["Seleccionado"] = 0
            return c
        })
        this.setState({ categorias_padre: [] }, () => this.setState({ categorias_padre: categorias }))
    }
    SeleccionarCategoriaHija = (Cod_Categoria, Seleccionado, index) => {
        var categorias = this.state.categorias.filter(c => {
            if (c.Cod_Categoria == Cod_Categoria)
                c["Seleccionado"] = Seleccionado == 1 ? 0 : 1
            else
                c["Seleccionado"] = 0
            return c
        })
        this.setState({
            categorias: categorias,
            productos: this.state.productos_todos.filter(p => p.Cod_Categoria == Cod_Categoria),
            currentIndex: index
        })
        setTimeout(() => {
            this.flatListRef.scrollToIndex({ animated: true, index });
        }, 1000)

    }
    RecuperarProductosXCategoria = (Cod_Categoria) => {
        this.setState({ buscando: true, productos: [] })
        fetchData('/get_productos_by_categoria','POST',{
            Cod_Categoria: Cod_Categoria
        },(data,err)=>{
            this.setState({ productos: data.productos, buscando: false })
        })
    }
    RecuperarCategorias_Todas = () => {
        this.setState({ productos: [] })
        fetchData('/get_categorias_todas','POST',{},(data,err)=>{
            this.setState({
                categorias: data.categorias
            })
        })
    }
    RecuperarProductos_Todos = () => {
        this.setState({ buscando: true, productos: [] })
        fetchData('/get_productos_todos','POST',{},(data,err)=>{
            this.setState({ productos_todos: data.productos, buscando: false })
        })
    }
    NuevaCuenta = () => {
        this.setState({ OpcionesVisible: false })
        const nuevo = NavigationActions.back({
            key: 'main',
        });
        store.dispatch({
            type: 'ADD_NUMERO_COMPROBANTE',
            Numero_Comprobante: '',
        })
        this.props.navigation.dispatch(nuevo)
    }
    IrIndex = () => {
        this.flatListRef.scrollToIndex({ animated: true, index: this.state.currentIndex });
    }
    render() {
        const { navigate, goBack } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor={global.tema.primaryDark}//"#F9360C"
                    barStyle="default"
                />
                <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: global.tema.primary, justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => goBack()} style={{ paddingHorizontal: 10 }}>
                        <IconMaterial color={'#FFF'} name='arrow-left' size={25} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{store.getState().Nom_Mesa}</Text>
                        <Text style={{ color: '#FFF' }}>Cuenta {store.getState().Numero_Cuenta}</Text>
                    </View>
                    {store.getState().Numero_Comprobante != '' &&
                        <TouchableOpacity onPress={() => this.setState({ OpcionesVisible: true })} style={{ paddingHorizontal: 10 }}>
                            <IconMaterial color={'#FFF'} name='dots-vertical' size={25} />
                        </TouchableOpacity>}
                </View>
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.buscando}
                    title="Buscando productos"
                    message="Por favor, espere..."
                />
                {/*<View style={{ backgroundColor: '#40407a' }}>
                    <ScrollView horizontal={true} >
                        {this.state.categorias_padre.map((c, index) =>
                            <TouchableOpacity onPress={() => this.SeleccionarCategoriaPadre(c.Cod_Categoria)}
                                activeOpacity={0.7} style={{ backgroundColor: '#40407a', marginRight: 1 }} key={c.Cod_Categoria}>
                                <Text style={{ color: c.Seleccionado == 1 ? '#55efc4' : '#95a5a6', paddingHorizontal: 5, paddingVertical: 10 }}>{c.Des_Categoria}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>*/}
                <View style={{ backgroundColor: '#FFF', flex: 1 }}>
                    <FlatList
                        ref={(ref) => { this.flatListRef = ref; }}
                        keyExtractor={item => item.Cod_Categoria}
                        data={this.state.categorias}
                        // initialScrollIndex={50}
                        // initialNumToRender={2}
                        renderItem={({ item, index }) => (
                            <View key={item.Cod_Categoria}>
                                <TouchableOpacity onPress={() => this.SeleccionarCategoriaHija(item.Cod_Categoria, item.Seleccionado, index)}
                                    activeOpacity={0.7} style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', marginRight: 1 }}>

                                    <Text style={{ color: item.Seleccionado == 1 ? global.tema.primary : '#95a5a6', flex: 1, fontWeight: 'bold', paddingHorizontal: 5, marginLeft: 10, paddingVertical: 10 }}>
                                        {item.Des_Categoria}
                                    </Text>
                                    <IconMaterial
                                        name={item.Seleccionado != 1 ? 'chevron-down' : 'chevron-up'}
                                        size={25} style={{ marginHorizontal: 10 }}
                                        color={item.Seleccionado == 1 ? global.tema.primary : '#95a5a6'}
                                    />

                                </TouchableOpacity>
                                {item.Seleccionado == 1 &&
                                    <View>
                                        <FlatList
                                            data={this.state.productos}
                                            renderItem={({ item }) => (
                                                <Producto producto={item} Cod_Mesa={store.getState().Cod_Mesa} navigate={navigate} />
                                            )}
                                            keyExtractor={(item, index) => index}
                                        />
                                    </View>}
                            </View>
                        )}
                    />
                    <View ref="pedidos_ref" >
                        {parseFloat(this.state.total) > 0 &&
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigate('pedido',
                                    { IdComprobanteOrigen: this.props.navigation.state.params.IdComprobanteOrigen })}
                                // onPress={this.IrIndex}
                                style={{
                                    height: 50, backgroundColor: global.tema.primaryDark,
                                    borderRadius: 5, marginHorizontal: 10, marginBottom: 10,
                                    flexDirection: 'row', alignItems: 'center'
                                }}>
                                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Ver Items ({this.state.cantidad_items})</Text>
                                </View>

                                {/* {<Text style={{ marginHorizontal: 10, fontWeight: 'bold', color: '#ffeaa7' }}>Total {(this.state.total).toFixed(2)}</Text>} */}
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <Dialog
                    visible={this.state.OpcionesVisible}
                    onTouchOutside={() => this.setState({ OpcionesVisible: false })} >
                    <View>
                        <TouchableOpacity activeOpacity={0.5} onPress={this.NuevaCuenta}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>Crear nueva cuenta</Text>
                        </TouchableOpacity>
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
});