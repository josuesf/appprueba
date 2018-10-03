import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Alert,
    Picker,
    ToastAndroid
} from 'react-native';
//Librerias Externas
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationActions } from 'react-navigation'
import { ConfirmDialog, ProgressDialog, Dialog } from 'react-native-simple-dialogs';
//Librias Propias
import { URL_WS } from '../Constantes'
import store from '../store'
import ProductoDivision from '../components/ProductoDivision';
import { fetchData } from '../utils/fetchData'

export default class AsignarCliente extends Component {

    //Personalizacion de Toolbar
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            title: 'Cliente',
            headerTintColor: '#FFF',
            headerBackTitle: 'Atras',
            headerStyle: {
                backgroundColor: '#84DCC6',
            },
            headerRight: (
                store.getState().tipo_usuario == 'EMPLEADO' &&
                <TouchableOpacity onPress={params.guardar} style={{ paddingHorizontal: 10 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text>
                </TouchableOpacity>
            ),
        }
    }
    //Variables e inicio de estado
    constructor(props) {
        super(props)
        this.state = {
            clientes: [],
            Id_ClienteProveedor: '',
            Id_Comprobante: props.navigation.state.params.Id_Comprobante,
            cliente_actual: null
        }
    }
    componentWillMount() {
        this.props.navigation.setParams({ guardar: this.AsignarIdCliente });
    }
    BuscarByNroDoc = () => {
        this.setState({
            Nombres: "",
            Direccion: "",
            Email: "",
            cliente_actual: null
        })
        fetchData('/get_by_nro_doc', 'POST',
            {
                Nro_Documento: this.state.Nro_Documento
            }
            , (res, err) => {
                if (err) console.log(err)
                console.log(res.respuesta)
                this.setState({
                    clientes: res.respuesta,
                    ClientesLista: true
                })
            })
    }
    BuscarByNombres = () => {
        this.setState({
            Nro_Documento: "",
            Direccion: "",
            Email: "",
            cliente_actual: null,
            Telefono:""
        })
        fetchData('/get_by_nombre', 'POST',
            {
                Nombres: this.state.Nombres
            }
            , (res, err) => {
                if (err) console.log(err)
                this.setState({
                    clientes: res.respuesta,
                    ClientesLista: true
                })
            })
    }
    LlenarCampos = (posicion) => {
        const { clientes } = this.state
        this.setState({

            Cod_TipoDocumento: clientes[posicion].Cod_TipoDocumento,
            Nombres: clientes[posicion].Cliente,
            Nro_Documento: clientes[posicion].Nro_Documento,
            Email: clientes[posicion].Email1,
            Direccion: clientes[posicion].Direccion,
            Telefono:clientes[posicion].Telefono1,
            ClientesLista: false,
            cliente_actual: clientes[posicion]
        })
    }
    AsignarIdCliente = () => {
        const Id_ClienteProveedor = this.state.cliente_actual!=null?this.state.cliente_actual.Id_ClienteProveedor:'-1'
        if (this.state.Nombres.length > 0)
            fetchData('/guardar_cliente', 'POST', {
                Id_ClienteProveedor,
                Cod_TipoDocumento:this.state.Cod_TipoDocumento,
                Nro_Documento:this.state.Nro_Documento,
                Cliente:this.state.Nombres,
                Direccion:this.state.Direccion,
                Email1:this.state.Email,
                Telefono1:this.state.Telefono,
                Cod_Usuario:store.getState().id_usuario
            }, (res, err) => {
                if (err){
                    console.log(err)
                    alert(err.toString())
                }else {
                    fetchData('/get_by_nro_doc', 'POST',
                        {
                            Nro_Documento: this.state.Nro_Documento
                        }
                        , (res, err) => {
                            if (err) alert('Ocurrio un error al guardar el cliente')
                            if (res.respuesta.length > 0) {
                                fetchData('/set_Id_Cliente_Comanda', 'POST',
                                    {
                                        Cliente: res.respuesta[0],
                                        Id_Comprobante: this.state.Id_Comprobante
                                    }
                                    , (res, err) => {
                                        if (err)
                                            console.log(err)
                                        else{
                                            ToastAndroid.show("Se guardo correctamente",ToastAndroid.SHORT)
                                            this.props.navigation.goBack()
                                        }
                                    })
                            }
                        })
                }
            })

    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView keyboardShouldPersistTaps="handled" ref='ref' style={styles.container}>
                <StatusBar
                    backgroundColor="#78C8B4"
                    barStyle="default"
                />

                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Tipo Documento</Text>
                    <Picker
                        selectedValue={this.state.Cod_TipoDocumento}
                        // style={{ height: 50, width: 100 }}
                        onValueChange={(itemValue, itemIndex) => this.setState({ Cod_TipoDocumento: itemValue })}>
                        <Picker.Item value="1" label="DNI" />
                        <Picker.Item value="6" label="RUC" />

                    </Picker>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Numero Documento</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.Nro_Documento}
                            onChangeText={(Nro_Documento) => this.setState({ Nro_Documento })}
                            selectionColor="#96E8C3" keyboardType="numeric"
                            style={styles.boxInput} underlineColorAndroid="#96E8C3" />
                        <TouchableOpacity onPress={this.BuscarByNroDoc} style={styles.boxButton}>
                            <Text style={styles.boxButtonText}>Buscar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Nombre Cliente</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.Nombres}
                            onChangeText={(Nombres) => this.setState({ Nombres })}
                            selectionColor="#96E8C3" style={styles.boxInput} underlineColorAndroid="#96E8C3" />
                        <TouchableOpacity onPress={this.BuscarByNombres} style={styles.boxButton}>
                            {/* <IconMaterial name="magnify" size={25}  color="#FFF"/> */}
                            <Text style={styles.boxButtonText}>Buscar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Correo @</Text>
                    <View style={styles.boxBody}>
                        <TextInput value={this.state.Email} 
                        onChangeText={(Email)=>{this.setState({Email})}}
                        selectionColor="#96E8C3" keyboardType="email-address" style={styles.boxInput} underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Direccion</Text>
                    <View style={styles.boxBody}>
                        <TextInput onChangeText={(Direccion)=>{this.setState({Direccion})}}
                         value={this.state.Direccion} multiline={true} numberOfLines={3} selectionColor="#96E8C3" style={styles.boxInput} underlineColorAndroid="#96E8C3" />
                    </View>
                </View>
                <View style={styles.boxRow}>
                    <Text style={styles.boxTitle}>Telefono</Text>
                    <View style={styles.boxBody}>
                        <TextInput onChangeText={(Telefono)=>{this.setState({Telefono})}}
                        value={this.state.Telefono} keyboardType="phone-pad" selectionColor="#96E8C3" style={styles.boxInput} underlineColorAndroid="#96E8C3" />
                    </View>
                </View>

                <Dialog
                    visible={this.state.ClientesLista}
                    onTouchOutside={() => this.setState({ ClientesLista: false })} >
                    <ScrollView>
                        <TouchableOpacity activeOpacity={0.5} onPress={() => this.setState({ ClientesLista: false })}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>Nuevo Cliente</Text>
                        </TouchableOpacity>
                        {this.state.clientes.map((c, i) =>
                            <TouchableOpacity key={c.Id_ClienteProveedor} activeOpacity={0.5}
                                onPress={() => this.LlenarCampos(i)}
                                style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                                <Text style={{ fontWeight: 'bold', color: 'gray' }}>{c.Cliente}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </Dialog>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    boxRow: { backgroundColor: '#FFF', marginLeft: 16, margin: 2, paddingVertical: 5, paddingHorizontal: 5 },
    boxTitle: { fontWeight: 'bold', color: '#78C8B4', fontSize: 12 },
    boxBody: { flexDirection: 'row', alignItems: 'center' },
    boxInput: { flex: 1 },
    boxButton: { backgroundColor: '#FFA69E', borderRadius: 5 },
    boxButtonText: { fontWeight: 'bold', padding: 5, color: '#FFF' }
});