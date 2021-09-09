import React from "react";
// import { makeStyles } from '@material-ui/core/styles';
import { Container, Grid, TextField, Button } from "@material-ui/core";
import { Navbar,  Spinner, Form, Row, Modal } from "react-bootstrap";
import web3Obj from './helper'
import db from './Firestore';
import Web3 from 'web3'
import { withRouter } from "react-router-dom";
import queryString from 'query-string';
import axios from 'axios'

class Claim extends React.Component {
  
  constructor(props){
    super(props)
     this.state={
       showModal: false,
       loading: true,
       selected:'',
       accountUser:'',
       registered: false,
       modal2: true,
       init: false,
       serverId: '',
       rewards: [],
    }
  }

  componentDidMount = async () =>{
    try{
      let params = queryString.parse(this.props.location.search)
      console.log(params)
      if(params.guildId){
        this.setState({serverId: params.guildId})
      } 
      if(params.userId){
        this.setState({userId: params.userId})
      }
      this.getTags()
      this.setState({loading: false, init: true})
    }
    catch(e){
      console.log(e)
    }
  }

  makeId = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
  }

  handleChange = (e, type, subType) =>{
    var {name, value} = e.target
    if(name=== 'tag') {
      var char1 = value.slice(-1);
      var cc = char1.charCodeAt(0);
        if ((cc > 47 && cc < 58) || (cc > 64 && cc < 91) || (cc > 96 && cc < 123)) {
          // alert('alpha')
      } else {
          alert("Embed ID can only be alphanumeric");
          return false;
      }
    }
    if(name === 'tSymbol'){
      value = value.toUpperCase()
    }
    if (type === 'reward'){
      const rewards = this.state.rewards
      var selected = ''
      rewards.map( rewardItem  => {
        if(subType === rewardItem.id){
          rewardItem.selected = !rewardItem.selected
          selected = rewardItem.id
        }
      })
      this.setState({rewards, selected})
    }
    this.setState({
        [name]: value
    })
  }

  setStateInfo = () => {
    web3Obj.web3.eth.getAccounts().then(accounts => {
      console.log(accounts)
      this.setState({ account: accounts[0] })
      web3Obj.web3.eth.getBalance(accounts[0]).then(balance => {
        this.setState({ balance: balance })
      })
      this.getUser(accounts[0], 'torus')
    })
  }

  getUser = async (account, source)=>{
    var reg = false

    await db.collection('users')
    .where("publicAddress", "==", account)
    .get()
    .then(qs=>{
        qs.forEach(doc=>{
        this.setState({registered: true, accountUser: doc.data()},()=>{
          // console.log(doc.data())
          reg = true
        })
      })
    })
    if(reg === false && source === 'torus'){
      const userInfo = await web3Obj.torus.getUserInfo();
      console.log(userInfo)
      const tag = this.makeId(8)
      const obj = {
        name: userInfo.name,
        email: userInfo.email,
        publicAddress: this.state.account,
        tag: tag,
        channelId: '',
        tokenCreated: false,
        liquidityPool: false,
        liquidityAdded: false,
        approval: false,
        tokenDetails:{
          tokenAddress:''
        }
      }
      
      const tagObj = {
        tag: tag,
        email: userInfo.email,
        address: this.state.account
      }

      const batch = db.batch();
      console.log(obj)
  
      const userRef = db.collection("users").doc(userInfo.email)
      const channelRef = db.collection("users").doc(userInfo.email).collection('channelData').doc('youtube')
      const servicesRef = db.collection("users").doc(userInfo.email).collection('channelData').doc('services')
      const groupsRef = db.collection("users").doc(userInfo.email).collection('channelData').doc('groups')
      const tagRef = db.collection("tags").doc(obj.tag)
  
      batch.set(userRef, obj);
      batch.set(tagRef, tagObj);
      batch.set(channelRef, {});
      batch.set(servicesRef, {});
      batch.set(groupsRef, {});
  
      // Commit the batch
      batch.commit().then(() => {
          alert("User Created")
          this.setState({registered: true})
          // this.getUser(this.state.account)
          window.location.href = (`/?tag=${obj.tag}`)
      })
    } else if (reg === false && source === 'metamask') {
      const tag = this.makeId(8)
      const email = window.prompt("Enter your Email ID to continue. This email will be associated with this account.")
      const obj = {
        name: 'John Doe',
        email: email,
        publicAddress: account,
        tag: tag,
        channelId: '',
        tokenCreated: false,
        liquidityPool: false,
        liquidityAdded: false,
        approval: false,
        tokenDetails:{
          tokenAddress:''
        }
      }
      
      const tagObj = {
        tag: tag,
        email: email,
        address: account
      }

      const batch = db.batch();
      console.log(obj)
  
      const userRef = db.collection("users").doc(email)
      const channelRef = db.collection("users").doc(email).collection('channelData').doc('youtube')
      const servicesRef = db.collection("users").doc(email).collection('channelData').doc('services')
      const groupsRef = db.collection("users").doc(email).collection('channelData').doc('groups')
      const tagRef = db.collection("tags").doc(obj.tag)
  
      batch.set(userRef, obj);
      batch.set(tagRef, tagObj);
      batch.set(channelRef, {});
      batch.set(servicesRef, {});
      batch.set(groupsRef, {});
  
      // Commit the batch
      batch.commit().then(() => {
          alert("User Created")
          this.setState({registered: true})
          // this.getUser(this.state.account)
          window.location.href = (`/claim`)
      })
    }
    else {
      this.setState({loading: false})
    }
  }

  getTags = ()=>{
    db.collection('tags')
      .get()
      .then((qs)=>{
        var tags = []
        var tagsData = []
        qs.forEach(doc=>{
          tags.push(doc.id)
          tagsData.push(doc.data())
        })
        this.setState({tags, tagsData})
        console.log(tags)
      })
  }

  metamaskFlow = () =>{
    this.setState({loading: true, init: false})
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try { 
         window.ethereum.enable().then(() =>{
             // User has allowed account access to DApp...
             console.log('Web3 injected')
             web3.eth.getAccounts().then(accounts => {
              console.log(accounts)
              this.setState({ account: accounts[0] })
              web3.eth.getBalance(accounts[0]).then(balance => {
                this.setState({ balance: balance })
              })
              this.getUser(accounts[0], 'metamask')
            })
         });
      } catch(e) {
         // User has denied account access to DApp...
         console.log('not accepted')
      }
   } else {
     alert ('no metamask')
   }
  }

  torusFlow = async () =>{
    this.setState({loading: true, init: false})
    const isTorus = sessionStorage.getItem('pageUsingTorus')?sessionStorage.getItem('pageUsingTorus'): false
    await web3Obj.initialize(isTorus).then(async() => {
      const userInfo = await web3Obj.torus.getUserInfo();
      console.log(userInfo)
      this.setStateInfo()
      console.log('here')
      // web3Obj.web3.eth.getAccounts().then(accounts =>{
      //   console.log(accounts)
      //   this.getUser(accounts[0])
      // })
    })
  }
  
  onServerSelect = async() =>{
    console.log('helo')
    await db.collection('rewardConfig').where('serverId', '==' ,this.state.serverId)
      .get()
      .then((qs)=>{
        var rewards = []
        var rewardsData = []
        qs.forEach(doc=>{
          doc.data().roles.map( roleItem =>{
            if(roleItem.quantity > 0){
              roleItem.selected = false
              rewards.push(roleItem)
            }            
          })
          rewardsData.push(doc.data())
          console.log(doc.data())
        })
        this.setState({rewards, rewardsData})
        console.log(rewards)
      })
  }

  rewardButtons = (params)=>{
    return(
      <button 
        type="button"
        className = {params.selected === true? "btngroup btngroup-active": "btngroup"}
        name = {params.camelName}
        value = { !params.selected}
        onClick = {(e)=>{params.handleChange(e,"drop_conditions")}}
      >
        {params.name}
      </button>
    )
  }

  claimReward = () =>{
    const web3 = new Web3(window.ethereum);
    const publicAddress = this.state.account
    const nonce = this.state.selected
      return new Promise((resolve, reject) =>
        web3.eth.personal.sign(
          `You are claiming reward with ID: ${nonce}`,
          publicAddress,
          (err, signature) => {
            if (err) return reject(err);
            // axios.post(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/addToRole`,
            // axios.post('http://localhost:3001/addToRole',
            axios.post(`http://node.tokentime.in/addToRole`,
              {
                userId: this.state.userId, 
                roleId: this.state.selected,
                guildId: this.state.serverId
              })
            .then(res =>{
              console.log(res)
            })
            return resolve({ publicAddress, signature });
          }
        )
      )
  }

  render(){
    return (
      this.state.loading?
        <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh"}}>
          <Spinner animation="border">

          </Spinner>
        </div>
      : this.state.init?
        <Container component="main" maxWidth="sm">
          <Modal show={this.state.modal2} onHide={()=>this.setState({modal2: false})}>
            <Modal.Header closeButton>
              <Modal.Title>Login Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button class="button" variant="primary" onClick={this.metamaskFlow}>
                Metamask
              </Button>
              <Button class="button" variant="primary" onClick={this.torusFlow}>
                Torus
              </Button>
            </Modal.Body>
          </Modal>
        </Container>
      : this.state.registered && this.state.accountUser?
        <Container component="main" maxWidth="sm">
          <div>
            <h1>Claim a reward</h1>
            <form>
            <h4>Server ID: </h4>
              <input 
                type= "text"
                className="input" 
                placeholder="1234567890"
                value={this.state.serverId}
                name="serverId"
                onChange = {this.handleChange}
              />
              
              <div className="one">
              </div>
              <Button
                onClick={this.onServerSelect}
                type="button"
                fullWidth
                variant="contained"
                class="button"
              >
                Get Rewards
              </Button>
            </form>
          </div>
          <div className="two">
            <h4>Reward Role</h4>
            <p>Roles that are available</p>
            <div className="parent">
              {
                this.state.rewards.length > 0 ?
                this.state.rewards.map( rewardItem =>{
                  return(
                    <button
                      type="button"
                      className = {rewardItem.selected === true? "btngroup btngroup-active": "btngroup"}
                      name = {rewardItem.name}
                      value = { !rewardItem.selected}
                      onClick = {(e)=>{this.handleChange(e,"reward", rewardItem.id)}}
                    >
                      {rewardItem.name}
                    </button>  
                  )
                })
                : ''
              }
            </div>
            <Button
              class="button"
              onClick = {this.claimReward}
            >
              Proceed
            </Button>
          </div>
        </Container>
      : 
        //Register
        <Row style={{justifyContent:"center", alignItems:"center"}}>
                
          <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
            <h1>Register New User</h1>

            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control required type="text" name="name" value={this.state.name} placeholder= "Enter your Name" onChange={this.handleChange} />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Your Display Name.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control required type="text" name="email" value={this.state.email} placeholder="Enter your Email" onChange={this.handleChange} />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Your Email that you used with the Torus Verifier. Please make sure it is same as we will use it to associate this public address with you.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicAddress">
              <Form.Label>Public Address</Form.Label>
              <Form.Control required type="text" value={this.state.account} placeholder={this.state.account} readOnly/>
              <Form.Text className="text-muted">
                This is your public account address, Save it to share with others
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicID">
              <Form.Label>Unique ID</Form.Label>
              <Form.Control required type="text" name="tag" value={this.state.tag} placeholder= "Enter ID" onChange={this.handleChange} />
              <Form.Control.Feedback type="valid" >Looks good!</Form.Control.Feedback>
              {/* <Form.Control.Feedback type="invalid">Already Exists</Form.Control.Feedback> */}

              <Form.Text className="text-muted">
                This is the embed ID that will point to your page, you can change it in future based on availability. 
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicID">
              <Form.Label>Youtube Channel ID</Form.Label>
              <Form.Control required type="text" name="channelId" value={this.state.channelId} placeholder= "Enter ID" onChange={this.handleChange} />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Your current YT channel id which you want to link with this platform. It can be found <a target="blank" href="https://youtube.com/account_advanced/">here.</a>
              </Form.Text>
            </Form.Group>
    
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Row>
    )
  }
}


export default withRouter(Claim);
