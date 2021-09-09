import React, { Component } from 'react'
import {Spinner} from 'react-bootstrap'
import axios from 'axios'
import ServerDetails from './ServerDetails'
import ConfigureConditions from './ConfigureConditions'
import Confirmation from './Confirmation'
import Success from './Success'
import Claim from './Claim'
import db from './Firestore';
import queryString from 'query-string';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


class Handler extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      loading: true,
      userInput: {
        serverId:"",
        claimable_once: true, 
        dropConditions:{
          credLevel: {
            name: "Cred Level",
            camelName: "credLevel",
            selected: true,
            allowedPercentile: ''
          },
          coinHoldings:{
            name: "Coin Holdings",
            camelName: "coinHoldings",
            selected: false,
            coinAddress:'', 
            minHeld: ''
          },
          currentDiscordRole: {
            name: "Current Discord Role",
            camelName: "currentDiscordRole",
            selected: false,
            roles:[]
          },
          serverTime:{
            name: "Server Time",
            camelName: "serverTime",
            selected: false,
            type:"joinedServer",
            duration:'',
            period:"months"
          },
          priceOfNFT:{
            name: "Price of NFT",
            camelName: "priceOfNFT",
            selected: false,
            price:'',
            currency:'ETH'
          },
          excludedRoles:{
            name: "Excluded Roles",
            camelName: "excludedRoles",
            selected: false,
            roles:[]
          },
        },
        rewardActiveTime: {
          name: "Reward Active Time",
          camelName: "rewardActiveTime",
          startDate: '',
          endDate: '',
          fixedTime: false,
          startTime: '10:00',
          endTime: '10:00',
          repeatsEvery: '',
          repeatInterval: '',
          selectedDays: {
            sunday: {
              selected: false,
              name: 'Sunday',
              camelName: 'sunday',
              day: 0,
              short: 'S'
            },
            monday: {
              selected: false,
              name: 'Monday',
              camelName: 'monday',
              day: 1,
              short: 'M'
            },
            tuesday: {
              selected: false,
              name: 'Tuesday',
              camelName: 'tuesday',
              day: 2,
              short: 'T'
            },
            wednesday: {
              selected: false,
              name: 'Wednesday',
              camelName: 'wednesday',
              day: 3,
              short: 'W'
            },
            thursday: {
              selected: false,
              name: 'Thursday',
              camelName: 'thursday',
              day: 4,
              short: 'T'
            },
            friday: {
              selected: false,
              name: 'Friday',
              camelName: 'friday',
              day: 5,
              short: 'F'
            },
            saturday: {
              selected: false,
              name: 'Saturday',
              camelName: 'saturday',
              day: 6,
              short: 'S'
            },
          }
        },
        message:{
          sendMessage: false,
          messageToSend: ''
        }
      },
      roles: []
    }
  }
  
  componentDidMount = async () => {
    //Fetch Roles
    
    this.setState({loading: false})
  }

  handleFetch = async () =>{
    this.setState({loading: true})
    // await axios.get(`http://node.tokentime.in/roles?guildId=${this.state.userInput.serverId}`).then(response => {
    await axios.get(`http://localhost:3001/roles?guildId=${this.state.userInput.serverId}`).then(response => {
      console.log(response.data)
      this.setState({roles: response.data},()=>{
        const roleArr = []
        const roleArr2 = []
        const roleArr3 = []
        response.data.map( roleItem => {
          roleArr.push({name: roleItem.name, quantity: 0, id: roleItem.id, claimed: 0})
          roleArr2.push({name: roleItem.name, id: roleItem.id, selected: false})
          roleArr3.push({name: roleItem.name, id: roleItem.id, selected: false})
        })
        const userInput = this.state.userInput
        userInput.roles = roleArr
        userInput.dropConditions.currentDiscordRole.roles = roleArr2
        userInput.dropConditions.excludedRoles.roles = roleArr3
        this.setState({userInput})
      })
    })
  
    // await axios.get(`http://node.tokentime.in/members?guildId=${this.state.userInput.serverId}`).then(response => {
    await axios.get(`http://localhost:3001/members?guildId=${this.state.userInput.serverId}`).then(response => {
      console.log(response.data)
        this.setState({memberCount: response.data.memberCount})
    })
    this.setState({loading: false})
  }

  // go back to previous step
  prevStep = () => {
    const { step } = this.state;
    this.setState({ step: step - 1 });
  }

  // proceed to the next step
  nextStep = () => {
    const { step, userInput } = this.state;
    // console.log(step)
    if(step === 1){
      const sum = this.state.userInput.roles.reduce((a, b) => ({quantity: parseInt(a.quantity) + parseInt(b.quantity)}));
      console.log(sum)
      if(userInput.serverId === ''){
        alert("You need to enter the server ID")
        return
      }
      if( sum.quantity <= 0 ){
        alert('You need to pick atleast one role to reward')
        return
      }
    }
    if(step === 3) {
      //TO BE USED WHEN SEPARATE FRONTEND
      // axios.post('http://localhost:3002/handle', {userInput}).then(response => {
      //   if(response.data.error){
      //     alert(response.data.error)
      //   } else {
      //     this.setState({step: 3})
      //     console.log(response)
      //   }
      // })

      db.collection("rewardConfig").add(this.state.userInput).then(docRef =>{
        console.log("Written with id ", docRef.id)
        this.setState({step: 3})  
      })
      
    }
    this.setState({ step: step + 1 });
  }

  setTime = (e, type) =>{
    if ( type === "startTime"){
      const userInput = this.state.userInput
      userInput.rewardActiveTime.startTime = e
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "endTime"){
      const userInput = this.state.userInput
      userInput.rewardActiveTime.endTime = e
      console.log(userInput)
      this.setState({userInput})
    }
  }

  // Handle fields change
  handleChange = (e, type, subType) => {
    const { name, value} = e.target
    console.log(name, value, type, subType)
    if(type === "role_quantity"){
      const userInput = this.state.userInput
      const arr = userInput['roles'].map(item =>{
        if(item.name === name && value >= 0){
          item.quantity = value
        }
        return item
      }) 
      userInput['roles'] = arr
      console.log(userInput)
      this.setState({userInput})
    } else if (type === "guildId"){
      const userInput = this.state.userInput
      userInput.serverId = value
      this.setState({userInput}, this.handleFetch)
    } else if ( type === "checkbox"){
      const item = !this.state.userInput[name]
      const userInput = this.state.userInput
      userInput[name] = item
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "drop_conditions"){
      const userInput = this.state.userInput
      userInput.dropConditions[name].selected = value === "true"? true : false
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "credLevel"){
      const userInput = this.state.userInput
      userInput.dropConditions.credLevel.allowedPercentile = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( subType === "coinAddress"){
      const userInput = this.state.userInput
      userInput.dropConditions.coinHoldings.coinAddress = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( subType === "minHeld"){
      const userInput = this.state.userInput
      userInput.dropConditions.coinHoldings.minHeld = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "currentDiscordRole"){
      const userInput = this.state.userInput
      userInput.dropConditions.currentDiscordRole.roles.map(item => {
        if(name === item.name){
          item.selected = value === "true"? true : false
        }
      })
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "excludedRoles"){
      const userInput = this.state.userInput
      userInput.dropConditions.excludedRoles.roles.map(item => {
        if(name === item.name){
          item.selected = value === "true"? true : false
        }
      })
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "serverTime" && subType === "duration"){
      const userInput = this.state.userInput
      userInput.dropConditions.serverTime.duration = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "startDate"){     
      const userInput = this.state.userInput
      userInput.rewardActiveTime.startDate = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "endDate"){
      const userInput = this.state.userInput
      userInput.rewardActiveTime.endDate = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "fixedTime"){
      const item = !this.state.userInput.rewardActiveTime.fixedTime
      const userInput = this.state.userInput
      userInput.rewardActiveTime.fixedTime = item
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "repeatsEvery"){
      const userInput = this.state.userInput
      userInput.rewardActiveTime.repeatsEvery = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "repeatInterval"){
      const userInput = this.state.userInput
      userInput.rewardActiveTime.repeatInterval = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "selectedDays"){
      const userInput = this.state.userInput
      Object.keys(userInput.rewardActiveTime.selectedDays).map(item => {
        if(name === userInput.rewardActiveTime.selectedDays[item].camelName){
          userInput.rewardActiveTime.selectedDays[item].selected = value === "true"? true : false
        }
      })
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "sendMessage"){
      const userInput = this.state.userInput
      userInput.message.sendMessage = !userInput.message.sendMessage
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "messageToSend"){
      const userInput = this.state.userInput
      userInput.message.messageToSend = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "serverId"){
      const userInput = this.state.userInput
      userInput.serverId = value
      console.log(userInput)
      this.setState({userInput})
    } else if ( type === "priceOfNFT"){
      const userInput = this.state.userInput
      userInput.dropConditions.priceOfNFT.price = value
      console.log(userInput)
      this.setState({userInput})
    } 

    // this.setState({ [name]: value });
    console.log(name, value)
  }

  HomeSwitch = (step, userInput, handleFetch) =>{
    // return(
      switch(step) {
        case 1: 
          return (
            <ServerDetails 
              nextStep={ this.nextStep }
              handleChange={ this.handleChange }
              roles = { userInput.roles }
              claimable_once = {userInput.claimable_once}
              serverId = {userInput.serverId}
              handleFetch = {handleFetch}
              userInput = { userInput}
            />
          )
        case 2: 
          return (
            <ConfigureConditions 
              prevStep={ this.prevStep }
              nextStep={ this.nextStep }
              handleChange={ this.handleChange }
              setTime = { this.setTime }
              memberCount = { this.state.memberCount }
              dropConditions= {userInput.dropConditions}
              dateObj = {userInput.rewardActiveTime}
              message = {userInput.message}

            />
          )
        case 3: 
            return (
              <Confirmation 
                prevStep={ this.prevStep }
                nextStep={ this.nextStep }
                dropConditions= {userInput.dropConditions}
                dateObj = {userInput.rewardActiveTime}
                message = {userInput.message}
              />
            )
          case 4: 
            return (
              <Success />
            )
        default: 
            return(
              <></>
            )
      }
    // )
  }

  render() {
    const { step } = this.state;
    const { email, username, password, firstName, lastName, country, levelOfEducation, roles, userInput } = this.state;
    const values = { email, username, password, firstName, lastName, country, levelOfEducation }
    if(this.state.loading){
      return(
        <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh"}}>
          <Spinner animation="border">

          </Spinner>
        </div>
      )
    } else {
      return(
        <Router>
          <Switch>
            <Route path="/about">
              About
            </Route>
            <Route path="/claim">
              <Claim />
            </Route>
            <Route path="/">
              {() => this.HomeSwitch(step, userInput, this.handleFetch)}
            </Route>
          </Switch>
        </Router>
      )
    }
  }
}

export default Handler