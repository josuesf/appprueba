import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { URL_WS } from '../Constantes';
import store from '../store'
const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 64
export default class Mesa extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Estado_Mesa: props.mesa.Estado_Mesa,
            Nro_Cuentas: props.mesa.Nro_Cuentas,
            Mesero: props.mesa.Mesero,
            Cod_Mesa: props.mesa.Cod_Mesa,
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.ref_Mesa && store.getState().last_event == 'ADD_ESTADO_MESA' && store.getState().Cod_Mesa == this.props.mesa.Cod_Mesa) {
                this.setState({ Estado_Mesa: store.getState().Estado_Mesa, Nro_Cuentas: this.state.Nro_Cuentas + 1 })
            }
        })
        store.getState().socket.on('NUEVA_COMANDA', (data) => {
            if (data.Cod_Mesa == this.state.Cod_Mesa) {
                this.setState({
                    Mesero: data.Cod_Usuario, Estado_Mesa: data.Estado_Mesa,
                    Nro_Cuentas: this.state.Nro_Cuentas + (data.Numero == '' ? 1 : 0)
                })
            }
        })
    }
    render() {
        const ColorMesa = (Estado_Mesa) => {
            if (Estado_Mesa == 'LIBRE')
                return '#33d9b2'
            else if (Estado_Mesa == 'PENDIENTE')
                return '#ffeaa7'
            else
                return '#ff7675'
        }
        return (
            <View style={{ alignItems: 'center', flexDirection: 'column' }}>

                <TouchableOpacity ref='ref_Mesa' activeOpacity={0.7} onPress={this.props.SeleccionarMesa} 
                    style={{
                    marginBottom: 10, height: this.props.width_state / 5, width: this.props.width_state / 5,
                    justifyContent: 'center',
                    backgroundColor: '#FFF', alignItems: 'center',
                    //borderColor: ColorMesa(this.state.Estado_Mesa), borderWidth: 2,
                    marginRight: 15
                }}>
                    {this.state.Nro_Cuentas > 0 && <View style={{ backgroundColor: 'red', height: 20, width: 20, borderRadius: 10, justifyContent: 'center' }}>
                        <Text style={{ color: '#FFF',fontSize:12,alignSelf:'center' }}>{this.state.Nro_Cuentas}</Text>
                    </View>}
                    <Text style={{ alignSelf: 'center', fontWeight: 'bold',fontSize:12, color: '#2c2c54' }}>{this.props.mesa.Nom_Mesa}</Text>
                    <Text style={{ fontSize: 8, color: '#2c2c54' }}>{this.state.Mesero}</Text>
                </TouchableOpacity>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        // shadowColor: 'black',
        // shadowOpacity: .2,
        // elevation: 2,
        // marginVertical: 2,
        // borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3
    },

});