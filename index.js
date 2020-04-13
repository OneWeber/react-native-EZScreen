import React,{Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ViewPropTypes,
    TouchableOpacity,
    Animated,
    Easing,
    Image,
    ScrollView,
} from 'react-native';
import {PropTypes} from 'prop-types'
const {width, height} = Dimensions.get('window')
export default class RNEazyScreen extends Component{
    constructor(props, context) {
        super(props, context);
        let selectIndex = this.props.selectIndex;
        if(selectIndex === undefined){
            selectIndex = new Array(this.props.screenData.length);
            for (let i = 0; i < selectIndex.length; i++) {
                selectIndex[i] = 0;
            }
        }
        // console.log(this.props.maxHeight);
        if(selectIndex.length !== this.props.screenData.length){
            throw new Error("selectIndex length is not equals data length");
        }
        let selectData = [];
        for(let i=0;i<this.props.screenData.length;i++){
            selectData[i] = ""
        }
        this.state = {
            activityIndex: -1,
            selectIndex: selectIndex,
            rotationAnims: props.screenData.map(() => new Animated.Value(0)),
            selectData:selectData
        }
    }
    static propTypes = {
        screenData: PropTypes.array,
        barHeight: PropTypes.number,
        barStyle: ViewPropTypes.style,
        siderPadding: PropTypes.number,
        activeTintColor: PropTypes.string,
        inactiveTintColor: PropTypes.string,
        customContent: PropTypes.element,
        //itemOnpress:PropTypes.fun,
        customFunc: PropTypes.func,
        //customData: [],
        selectHeader: PropTypes.func
    }
    static defaultProps = {
        screenData: [],
        barHeight: 40,
        siderPadding: width*0.03,
        activeTintColor: '#14c5ca',
        inactiveTintColor: '#333',
        customFunc: () => {},
        itemOnpress: () => {},
        customData: [],
        clickPanelItem: () => {}

    }
    _selectHeader(data, index) {
        this.openOrClosePanel(index);
        this.props.selectHeader(data, index)
    }
    openOrClosePanel(index) {
        const {screenData} = this.props
        if(screenData[index].type===2){
            this.props.customFunc(index)
        }
        if (this.state.activityIndex == index) {
            this.closePanel(index);
            this.setState({
                activityIndex: -1,
            });
            // toValue = 0;
        } else {
            if (this.state.activityIndex > -1) {
                this.closePanel(this.state.activityIndex);
            }
            this.openPanel(index);
            this.setState({
                activityIndex: index,
            });
        }

    }
    openPanel(index) {
        Animated.timing(
            this.state.rotationAnims[index],
            {
                toValue: 0.5,
                duration: 300,
                easing: Easing.linear
            }
        ).start();
    }
    closePanel(index) {
        Animated.timing(
            this.state.rotationAnims[index],
            {
                toValue: 0,
                duration: 300,
                easing: Easing.linear
            }
        ).start();
    }
    itemOnpress(index){
        const {selectData, activityIndex} = this.state;
        let data = selectData
        const {screenData} = this.props;
        data[activityIndex] = {
            title:screenData[activityIndex].data[index].title,
            index: index
        };
        this.setState({
            selectData: data
        })
        this.props.itemOnpress(activityIndex, index, screenData[activityIndex].data[index]);
        this.openOrClosePanel(activityIndex)
    }
    renderContent(){
        const {activityIndex, selectData} = this.state;
        const {screenData, activeTintColor} = this.props;
        if(this.state.activityIndex >= 0){
            return <View style={{flex: 1,position:'absolute',left:0,right:0,bottom:0,top:40}}>
            {
                activityIndex === -1
                    ?
                    null
                    :
                    screenData[activityIndex].type === 1
                        ?

            <TouchableOpacity
                style={styles.conBg}
                onPress={()=>this.openOrClosePanel(activityIndex)}
            >
                {
                    screenData[activityIndex].data.map((item, index) => {
                        return <TouchableOpacity  key={index} style={[styles.spaceRow,{
                            height: 50,
                                borderBottomWidth: 1,
                                borderBottomColor:'#f5f5f5',
                                backgroundColor:'#fff',
                                paddingLeft: this.props.siderPadding,
                                paddingRight: this.props.siderPadding,
                        }]}
                        onPress={()=>this.itemOnpress(index)}
                    >
                    <Text style={{
                            color:index === selectData[activityIndex].index?activeTintColor:'#333',
                                fontSize: 13
                        }}>{item.title}</Text>
                        {
                            index === selectData[activityIndex].index
                                ?
                        <Image
                            style={{
                            tintColor: activeTintColor
                        }}
                            source={require('./images/menu_check.png')}/>
                        :
                            null
                        }
                    </TouchableOpacity>
                    })
                }
            </TouchableOpacity>
            :
                screenData[activityIndex].type === 3
                    ?
            <View
                style={styles.conBg}
                    >
                    <View style={{width:width,height:height*0.6,backgroundColor:'#fff'}}>
                {this.props.customContent}
            </View>
            </View>
            :
                null
            }
        </View>
        } else {
            return (null)
        }

    }
    render(){
        const {activityIndex, selectData} = this.state;
        const {activeTintColor, inactiveTintColor} = this.props;
        return(
            <View style={{flex: 1,position:'relative'}}>
    <View style={[this.props.barStyle,styles.spaceRow,{
            width: width,
                height: this.props.barHeight,
                paddingLeft: this.props.siderPadding,
                paddingRight: this.props.siderPadding,
        },this.props.style]}>
        {
            this.props.screenData.map((item, index) => {
                return <TouchableOpacity key={index} style={[styles.flexCenter,{
                    height: this.props.barHeight,
                }]}
                onPress={()=>this._selectHeader(item, index)}
            >
            <Text
                numberOfLines={1} ellipsizeMode={'tail'}
                style={{fontWeight:'bold',maxWidth:80}}>
                {selectData[index]?selectData[index].title:item.title}
            </Text>
                <Animated.Image
                source={require('./images/dropdown_arrow.png')}
                style={{
                    width:10,
                        height:6,
                        marginLeft: 8,
                        tintColor:index===activityIndex?activeTintColor:inactiveTintColor,
                        transform: [{
                        rotateZ: this.state.rotationAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                        })
                    }]
                }} />
                </TouchableOpacity>
            })
        }
    </View>
        {this.props.children}
        {this.renderContent()}
    </View>
    )
    }
}
const styles = StyleSheet.create({
    flexStart:{
        justifyContent:'flex-start',
        alignItems:'center',
        flexDirection:'row'
    },
    flexCenter: {
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    },
    spaceRow:{
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'row'
    },
    conBg:{
        position:'absolute',
        left:0,
        right:0,
        top:0,
        bottom:0,
        backgroundColor:'rgba(0,0,0,.3)'
    }
})

