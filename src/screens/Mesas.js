/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
    Dimensions,
    Vibration,
    ScrollView,
} from 'react-native';
import Swiper from 'react-native-swiper'


import { fetchData } from '../utils/fetchData'
import Ambiente from '../components/Ambiente';
export default class Mesas extends Component {
    static navigationOptions = {
        header: null,
        // title: 'Mesas'
        // tabBarLabel: 'Mesas',
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            ambientes: []
        }
    }
    componentWillMount() {
        this.CargarAmbientes()
    }
    CargarAmbientes = () => {
        fetchData('/get_ambientes', 'POST', {}, (res, err) => {
            if (err) console.log(err)
            this.setState({
                ambientes: res.respuesta
            })
        })
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

    render() {

        return (
            <View style={styles.container} >
                <StatusBar
                    backgroundColor={global.tema.primaryDark}//"#66B09E"
                    barStyle="default"
                />
                {/* <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                > */}
                <Swiper dot={<View style={{ backgroundColor: 'rgba(255,255,255,.3)', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7 }} />}
                    activeDot={<View style={{ backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7 }} />} loop={false}>
                    {this.state.ambientes.map(ambiente =>
                        <Ambiente key={ambiente.Cod_Ambiente} Nom_Ambiente={ambiente.Nom_Ambiente} Cod_Ambiente={ambiente.Cod_Ambiente} navigation={this.props.navigation} />
                    )}
                </Swiper>
                {/* </ScrollView> */}

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
        color: 'white',
        marginVertical: 10,
        fontWeight: 'bold',
        fontSize: 18
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