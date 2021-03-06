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
import { ConfirmDialog,Dialog } from 'react-native-simple-dialogs';
import CheckBox from '../components/CheckBox'

const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 50
export default class ProductoSeleccionado extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Cantidad: this.props.producto.Cantidad,
            producto_detalles: store.getState().producto_detalles.filter(p => (p.Id_Referencia == this.props.producto.Id_Detalle && (!p.Numero || p.Numero==props.producto.Numero))),
            para_llevar: this.props.producto.para_llevar,
            notaProducto: false,
            Obs_ComprobanteD: props.producto.Obs_ComprobanteD
        }
    }

    AgregarProducto = () => {
        var producto = this.props.producto
        producto.Cantidad = this.state.Cantidad + 1
        this.setState({
            Cantidad: producto.Cantidad
        }, () => {
            store.dispatch({
                type: 'ADD_PRODUCTO',
                producto: producto,
            })
        })
    }
    RestarProducto = () => {
        if (parseInt(this.state.Cantidad) > 0) {
            var producto = this.props.producto
            producto.Cantidad = this.state.Cantidad - 1
            this.setState({
                Cantidad: producto.Cantidad
            }, () => {
                store.dispatch({
                    type: 'RESTAR_PRODUCTO',
                    producto: producto,
                })
            })
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
    GuardarObsComp=()=>{
        this.props.producto.Obs_ComprobanteD = this.state.Obs_ComprobanteD
        this.setState({notaProducto:false})
    }
    render() {
        const moneda = 'S/. '
        const { producto_detalles } = this.state
        return (
            <View ref="root" style={styles.container}>
                <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

                    <Image
                        //source={{ uri: 'http://image.flaticon.com/icons/png/512/66/66550.png' }}
                        source={require('../images/plato_default.png')}
                        style={{
                            marginLeft: 10,
                            width: AVATAR_SIZE, height: AVATAR_SIZE
                        }} />

                    <View style={{ flexDirection: 'column', marginHorizontal: 10, }}>
                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                            {this.props.producto.Estado_Pedido == 'CONFIRMA' && <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#95a5a6' }} >({this.state.Cantidad + ") "}</Text>}
                            <Text style={{ color: '#95a5a6', fontWeight: 'bold', marginRight: 40 }}>{this.props.producto.Nom_Producto}</Text>
                            <Text style={{ color: '#95a5a6', fontSize: 0, marginLeft: 2 }}>{moneda + (parseFloat(this.props.producto.PrecioUnitario)).toFixed(2)}</Text>
                        </View>

                        {this.state.producto_detalles.map((p, index) => <Text key={index} style={{ color: '#95a5a6', fontSize: 12 }} >{p.Cantidad + " " + p.Nom_Producto + " S./" + p.PrecioUnitario.toFixed(2)}</Text>)}


                        {this.props.producto.Estado_Pedido != 'CONFIRMA' && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {parseInt(this.props.producto.Cantidad) > 1 &&
                                <TouchableOpacity onPress={() => this.RestarProducto()} style={{ marginRight: 10 }}>
                                    <IconMaterial color={global.tema.primary}name='minus-box-outline' size={30} />
                                </TouchableOpacity>
                            }

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#95a5a6' }} >{this.state.Cantidad}</Text>
                            <TouchableOpacity onPress={() => this.AgregarProducto()} style={{ marginLeft: 10 }}>
                                <IconMaterial color={global.tema.primary} name='plus-box-outline' size={30} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ preguntaEliminar: true })} style={{ marginLeft: 10 }}>
                                <IconMaterial color="#95a5a6" name='delete' size={30} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ notaProducto: true })} style={{ marginLeft: 10 }}>
                                <IconMaterial color="#95a5a6" name='message-text-outline' size={25} />
                            </TouchableOpacity>
                            <CheckBox onPress={() => this.SeleccionarCheck()}
                                style={{ padding: 5 }}
                                colorInactive={"#95a5a6"}
                                value={this.state.para_llevar}
                                textValue={"Para llevar"}
                                textPrecio={""}
                                colorActive={global.tema.primary}
                                textStyle={{ color: '#95a5a6' }} />
                            
                        </View>}
                    </View>


                </View>
                <View style={{ flex: 1, paddingRight: 5, paddingLeft: 50 }}>
                    <Text style={{ fontWeight: 'bold', color: '#95a5a6' }}>

                        {moneda +
                            (parseFloat(this.props.producto.PrecioUnitario) * parseFloat(this.props.producto.Cantidad)).toFixed(2)
                        }
                    </Text>
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
                    <Text style={{fontWeight:'bold',fontSize:18}}>Notas extras</Text>
                    <TextInput onChangeText={(text)=>this.setState({Obs_ComprobanteD:text})} 
                        value={this.state.Obs_ComprobanteD}
                        numberOfLines={4} multiline={true} placeholder="Ejemplo: Poco aji,etc"/>
                    <TouchableOpacity 
                        onPress={this.GuardarObsComp} 
                        style={{backgroundColor:'#000'}}>
                        <Text style={{color:'white',padding:10,alignSelf:'center',fontWeight:'bold'}}>Guardar</Text>
                    </TouchableOpacity>
                </Dialog>

            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        // shadowColor: 'black',
        // shadowOpacity: .2,
        // elevation: 2,
        // marginVertical: 2,
        //borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        flexDirection: 'row',
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