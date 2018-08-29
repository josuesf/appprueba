import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    Platform,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { URL_WS } from '../Constantes';
import store from '../store'
import { ConfirmDialog, Dialog } from 'react-native-simple-dialogs';
import CheckBox from '../components/CheckBox'

const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 50
export default class ProductoDivision extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Cantidad: this.props.producto.Cantidad,
            producto_detalles: store.getState().producto_detalles.filter(p => p.Id_Referencia == this.props.producto.Id_Detalle),
            para_llevar: this.props.producto.para_llevar,
            notaProducto: false,
            cantidad_seleccionada: this.props.producto.cantidad_seleccionada
        }
    }

    AgregarProducto = () => {
        if(this.state.Cantidad>0){
            this.setState({
                cantidad_seleccionada: this.state.cantidad_seleccionada + 1,
                Cantidad: this.state.Cantidad - 1
            },()=>{
                this.props.agregar(this.props.producto,this.state.cantidad_seleccionada)
            })
            
        }
    }
    RestarProducto = () => {
        if(this.state.cantidad_seleccionada>0){
            this.setState({
                cantidad_seleccionada: this.state.cantidad_seleccionada - 1,
                Cantidad: this.state.Cantidad + 1
            })
            this.props.quitar(this.props.producto,this.state.cantidad_seleccionada)
        }
    }
    BorrarProducto = () => {
        store.dispatch({
            type: 'DELETE_PRODUCTO',
            producto: this.props.producto,
        })
        this.setState({ preguntaEliminar: false })
    }
    SeleccionarCheck = () => {
        var producto = this.props.producto
        producto.para_llevar = !this.state.para_llevar
        this.setState({ para_llevar: !this.state.para_llevar },
            // () => {
            //     store.dispatch({
            //         type: 'PARA_LLEVAR_PRODUCTO',
            //         producto:producto,
            //     })
            // }
        )

    }
    render() {
        const moneda = 'S/. '
        const { producto_detalles } = this.state
        const {divisible } =this.props
        return (
            <View ref="root" style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20 }}>
                    {divisible && 
                    <TouchableOpacity onPress={() => this.RestarProducto()} style={{ marginRight: 10 }}>
                        <IconMaterial color={"#ef6d13"} name='minus-box-outline' size={30} />
                    </TouchableOpacity>}

                    {divisible && <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#95a5a6' }} >{this.state.cantidad_seleccionada}</Text>}
                    {divisible && <TouchableOpacity onPress={() => this.AgregarProducto()} style={{ marginLeft: 10 }}>
                        <IconMaterial color={"#ef6d13"} name='plus-box-outline' size={30} />
                    </TouchableOpacity> }
                    <Text style={{ color: '#95a5a6', fontWeight: 'bold', marginRight: 40, marginLeft: 10, flex: 1 }}>{this.props.producto.Nom_Producto}</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#95a5a6' }} > {this.state.Cantidad}</Text>

                </View>

                <ConfirmDialog
                    title="Quitar producto"
                    message="Esta seguro de quitar este producto de tu orden?"
                    visible={this.state.preguntaEliminar}
                    onTouchOutside={() => this.setState({ preguntaEliminar: false })}
                    positiveButton={{
                        title: "SI",
                        onPress: () => this.BorrarProducto()
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => this.setState({ preguntaEliminar: false })
                    }}
                />
                <Dialog
                    onRequestClose={() => this.setState({ notaProducto: false })}
                    onTouchOutside={() => this.setState({ notaProducto: false })}
                    visible={this.state.notaProducto}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Notas extras</Text>
                    <TextInput numberOfLines={4} multiline={true} placeholder="Ejemplo: Poco aji,etc" />
                    <TouchableOpacity style={{ backgroundColor: '#000' }}>
                        <Text style={{ color: 'white', padding: 10, alignSelf: 'center', fontWeight: 'bold' }}>Guardar</Text>
                    </TouchableOpacity>
                </Dialog>

            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        // shadowColor: 'black',
        // shadowOpacity: .2,
        // elevation: 2,
        // marginVertical: 2,
        //borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        paddingBottom: 10

    },
    image: {
        width: 50,
        height: 50,

    },
    info: {
        flexDirection: 'column',
    },
    name: {
        fontSize: 11,
        textAlign: 'left',
        fontWeight: 'bold',
        marginLeft: 5
    },
    subTitulo: {
        marginLeft: 5,
        fontSize: 11,
        fontWeight: 'bold',
        color: 'darkgray'
    },
    descripcion: {
        fontSize: 11,
        color: 'darkgray'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 30,
        marginTop: 15
    },
    iconContainer: {
        flexDirection: 'column',
        flex: 1,

    },
    icon: {
        alignItems: 'center',
    },
    count: {
        color: 'gray',
        textAlign: 'center'
    },
    avatar: {
        marginLeft: 15,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },

});