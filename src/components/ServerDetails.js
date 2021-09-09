import React from "react";
// import { makeStyles } from '@material-ui/core/styles';
import { Container, Grid, TextField, Button } from "@material-ui/core";
import {
  withRouter
} from "react-router-dom";
import queryString from 'query-string';

class ServerDetails extends React.Component{
  constructor(props){
    super(props)

  }

  componentDidMount = () =>{
    let params = queryString.parse(this.props.location.search)
    if(params.guildId && !this.props.userInput.serverId){
      const obj = {
        target:{
          name: 'guildId',
          value: params.guildId
        }
      }
      this.props.handleChange(obj, 'guildId')
    }
    console.log(params)
  }

  render(){
    return(
      ServerDetailsComponent(this.props)
    )
  }
}


const RoleComponent = (params) =>{
  return(
    <div className="bgBtnMain">
      <input
        type="text"
        disabled
        placeholder={params.params}
        value={params.name}
        className="inputNew"
      />
      <input
        type="number"
        style={{width: "12%"}}
        placeholder={'0'}
        value={params.input}
        className="inputNew"
        name= {params.name}
        onChange= { (e) => params.handleChange(e, "role_quantity")}
      />
    </div>
  )
}


const ServerDetailsComponent = ({ nextStep, handleChange, roles, claimable_once, serverId, handleFetch }) => {
  // for continue event listener
  const Continue = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <Container component="main" maxWidth="sm">
      <div>
        <h1>Create a new reward</h1>
        <div className="middle">
          <h5>Select Drop Conditions and reward properties</h5>
        </div>
        <form>
        <h4>Server ID: </h4>
          <input 
            type= "text"
            className="input" 
            placeholder="1234567890"
            value={serverId}
            name="serverId"
            onChange = {(e) =>{handleChange(e, "serverId")}}
          />
          <Button
            class="button"
            onClick={() => handleFetch()}
          >
            OK
          </Button>
          <div className="one">
            <h4>Reward Type</h4>
            <p>Select the type of reward</p>
            <select>
              <option value="" disabled hidden>
                Select a role ID
              </option>
              <option value="discordRole" selected>Discord Role</option>
            </select>
          </div>
          {
            roles?
            <div 
              className="two"
            >
              <h4>Reward Role</h4>
              <p>Roles that are rewarded</p>
              <div className="parent">
                {
                  roles.map( roleItem =>{
                    return(
                      <RoleComponent name={roleItem.name} handleChange={handleChange} input={roleItem.quantity} />
                    )
                  })
                }
              </div>
              <div>
                <input type="checkbox" id="css" name="claimable_once" value={!claimable_once} checked={ claimable_once} onChange={(e) => handleChange(e, "checkbox")} /> {" "}
                <label for="css">
                  Only one role claimable by each user
                </label>
              </div>
            </div>
            : <></>
          }
          <Button
            onClick={Continue}
            type="submit"
            fullWidth
            variant="contained"
            class="button"
          >
            Next
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default withRouter(ServerDetails);