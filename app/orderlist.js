import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ListView,
  Image,
  Modal,
  Navigator,
  TouchableOpacity,
  RefreshControl
} from 'react-native'

const width = Dimensions.get('window').width

import Icon from 'react-native-vector-icons/Ionicons'
import DropdownAlert from 'react-native-dropdownalert'

import Header from './header'
import Detail from './orderdetail'
import Network from '../config/network'
var moment = require('moment')

let cache = {
  data: [],
  page: 1,
  totalLength: 0,
  id: null
}

class Orderlist extends Component {
  constructor() {
    super()
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      isRefreshing: false,
      dataSource: ds.cloneWithRows([]),
      title: '未完成'
    }
  }

  componentDidMount(){
    cache.data = []
    cache.page = 1
    cache.totalLength = 0
    this._submit(1)
  }

  _renderRow(row){
    return(
      <TouchableOpacity style={styles.ABox} onPress={() => this._loadPage(row)} key={row._id}>
        <View style={styles.ALeft}><Text style={styles.ALeftText}>{moment(row.meta.createAt).format('YYYY-MM-DD HH:mm:ss')}</Text></View>
        <View style={styles.ARight}><Text style={styles.ALeftText}>申请人：{row.user.name}</Text></View>
      </TouchableOpacity>
      )
  }

  _loadPage(row) {
    this.props.open(row)
  }

  _submit(page, id){
    var that = this
    Network.get('http://127.0.0.1:3000/api/orderlist',{id: id||this.props.id, page:page})
    .then(function (response) {
      if(response){
        cache.data = cache.data.slice().concat(response.orders)
        that.setState({dataSource: that.state.dataSource.cloneWithRows(cache.data), title: response.title})
        cache.totalLength = response.ordersTotal.length
        cache.page++
        cache.id = that.props.id
      }
    })
    .catch(function (error) {
      console.log(error)
    })
  }

  _renderFooter(){
    return(
      <View style={styles.footer}><Text style={styles.footertitle}>Powered by WUDI</Text></View>
    )
  }

  _fetchMoreData(){
    if(cache.totalLength > cache.data.length) {
      this._submit(cache.page)
    } 
  }

  _renderHeader(){
    
  }

  _onRefresh(){
    cache.data = []
    cache.page = 1
    cache.totalLength = 0
    this._submit(1, cache.id)
  }

  render(){
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow.bind(this)}
        renderFooter={this._renderFooter.bind(this)}
        renderHeader={this._renderHeader.bind(this)}
        onEndReached={this._fetchMoreData.bind(this)}
        onEndReachedThreshold={20}
        enableEmptySections={true}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._onRefresh.bind(this)}
            tintColor='#ff6600'
            title='拼命加载中...'
          />
        }
      />
    )
  }
}

export default class SuperOrderList extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      id: this.props.id,
      title: this.props.title,
      modalVisible: false,
      order: null
    };
  }

  _openDrawer(){
    this.props.onSelect()
  }

  _back(){
    this.props.navigator.pop()
  }

   _close(){
    this.setState({modalVisible: false})
  }

  _open(obj){
    this.setState({
      modalVisible: true,
      order: obj
    })
  }

   _sub(){
    cache.data = []
    cache.page = 1
    cache.totalLength = 0
    this.refs.orderlist._submit(1, cache.id)
  }

  _alert(){
    this.dropdown.alertWithType('success', '完成本次工单', '请联系机主认领！')
  }

  render(){
    return(
      <View style={styles.container}>
        <Header onSelect={this._openDrawer.bind(this)} sub={this.state.title} back={this._back.bind(this)}/>
        <Orderlist id={this.state.id} open={this._open.bind(this)} ref='orderlist'/>
        <Modal visible={this.state.modalVisible} animationType={'slide'} transparent ={false}>
          <View style={styles.closeBTN}>
            <Icon name={'ios-close-outline'} size={80} color={'#000'} onPress={this._close.bind(this)}></Icon>
          </View>
          <Detail alert={this._alert.bind(this)} order={this.state.order} close={this._close.bind(this)} sub={this._sub.bind(this)}/>
        </Modal>
        <DropdownAlert ref={(ref) => this.dropdown = ref} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  ABox: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    justifyContent: 'space-between'
  },
  ALeftText: {
    fontSize:20
  },
  header: {
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#f0f8ff',
  },
  headerTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  closeBTN: {
    backgroundColor: '#F5FCFF',
    paddingLeft: width / 2 - 10,
    paddingTop: 30,
    paddingBottom: 22
  },
  footertitle: {
    textAlign: 'center',
    fontSize: 10,
    color: '#000',
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 100,
    width: width,
  }
})