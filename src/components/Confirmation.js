import React from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
} from "@material-ui/core";
import TimePicker from 'react-time-picker';

const DropConditions = (params)=>{
  return(
    <button 
      type="button"
      disabled
      className = {params.selected === true? "btngroup btngroup-active": "btngroup"}
      name = {params.camelName}
      value = { !params.selected}
      onClick = {(e)=>{params.handleChange(e,"drop_conditions")}}
    >
      {params.name}
    </button>
  )
}

const SelectedDays = (params)=>{
  return(
    <button 
      disabled
      type="button"
      className = {params.selected === true? "circle circle-active": "circle"}
      name = {params.camelName}
      value = { !params.selected}
      onClick = {(e)=>{params.handleChange(e,"selectedDays")}}
    >
      {params.name}
    </button>
  )
}

const TextInput = (params) =>{
  return(
    <input 
      disabled
      type= {params.type}
      className="input" 
      placeholder="Eg: 10%"
      value={params.value}
      name={params.subType? params.subType: params.camelName}
      onChange = {(e) =>{params.handleChange(e, params.data.camelName, params.subType)}}
    />
  )
}

const PersonalDetails = ({ prevStep, nextStep, handleChange, dropConditions, dateObj, message, setTime }) => {
  const Continue = (e) => {
    e.preventDefault();
    nextStep();
  };

  const Roles = (params) =>{
    return(
      <button 
        type="button"
        disabled
        className = {params.selected === true? "btngroup btngroup-active": "btngroup"}
        name = {params.name}
        value = { !params.selected}
        onClick = {(e)=>{params.handleChange(e, params.camelName)}}
      >
        {params.name}
      </button>
    )
  }

  const Previous = (e) => {
    e.preventDefault();
    prevStep();
  };

  return (
    <Container component="main" maxWidth="sm">
      <div>
        <h1>Create a new reward</h1>
        <div className="middle">
          <h5>Select Drop Conditions and reward properties</h5>
        </div>
        <form>
          <div style={{ float: "left" }}>
            <div className="one">
              <h4>Drop Conditions</h4>
              <p>
                conditions according to which the rewards are distributed (multi
                select)
              </p>
              <div className="btns">
                {
                  Object.keys(dropConditions).map((item, index) => {
                    return (
                      <DropConditions
                        name={dropConditions[item].name}
                        selected={dropConditions[item].selected}
                        handleChange= {handleChange}
                        camelName = {dropConditions[item].camelName}
                      />
                    )}
                  )
                }
              </div>
            </div>
            <div className="two">
              <h4>Cred Level Filters</h4>
              <p>select percent of top cred level eligible for reward</p>
              <div className="data">
                <p>Top</p>
                <TextInput 
                  handleChange={handleChange} 
                  data={dropConditions.credLevel}
                  value = {dropConditions.credLevel.allowedPercentile }
                  type="number"  
                />
                <p>% which is</p>
                <input
                  disabled
                  type="text"
                  className="input"
                  placeholder="1000 members"
                />
              </div>
            </div>
            <div className="three">
              <h4>Coin Holdings</h4>
              <p>Coin Address</p>
              <TextInput 
                  handleChange={handleChange}
                  data={dropConditions.coinHoldings}
                  value = {dropConditions.coinHoldings.coinAddress }
                  subType="coinAddress"
                  type="text"
                />
              <p>Minimum Tokens Held</p>
              <TextInput 
                  handleChange={handleChange}
                  data={dropConditions.coinHoldings}
                  value = {dropConditions.coinHoldings.minHeld }
                  subType="minHeld"
                  type="number"
              />
            </div>
          </div>
          <div className="four">
            <h4>Current Discord Role</h4>
            <p>
              conditions according to which the rewards are distributed (multi
              select)
            </p>
            <div className="btns">
              {
                dropConditions.currentDiscordRole.roles.map((item, index) => {
                  return (
                    <Roles
                      name={item.name}
                      selected={item.selected}
                      handleChange= {handleChange}
                      camelName = {"currentDiscordRole"}
                    />
                  )
                })
              }
            </div>
          </div>
          <div className="five">
            <h4>Server Time</h4>
            <div className="data">
              <p>Time since</p>
              <select placeholder="Joined Server">
                <option value="joinedServer" selected>Joined Server</option>
              </select>
              <input 
                disabled
                type="number" 
                className="input" 
                placeholder="Eg: 2" 
                value = {dropConditions.serverTime.duration }
                onChange = {(e)=>{handleChange(e, "serverTime", "duration")}}
              />
              <select placeholder="Joined Server">
                <option value="weeks">Weeks</option>
                <option value="months" selected>Months</option>
              </select>
            </div>
          </div>
          <div className="six">
            <h4>Price of NFT</h4>
            <div className="bgBtn">
              <input type="text" placeholder="Enter price of NFT" />
              <select>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <button className="newDark">Add another currency</button>
          </div>
          <div className="seven">
            <h4>Exclude Roles</h4>
            <p>
              Members with these current roles will be excluded from the reward.
            </p>
            <div className="btns">
            {
                dropConditions.excludedRoles.roles.map((item, index) => {
                  return (
                    <Roles
                      name={item.name}
                      selected={item.selected}
                      handleChange= {handleChange}
                      camelName = {"excludedRoles"}
                    />
                  )
                })
              }
            </div>
          </div>
          <div className="eight">
            <h4>Reward Active Time</h4>
            <p>Start Date</p>
            <input 
              disabled
              type="date" 
              name="startDate" 
              placeholder="Date" 
              className="input" 
              value={dateObj.startDate} 
              onChange={(e) => handleChange(e, "startDate")}
            />
            <p>End Date</p>
            <input 
              disabled
              type="date" 
              name="endDate" 
              placeholder="Date" 
              className="input" 
              value={dateObj.endDate} 
              onChange={(e) => handleChange(e, "endDate")}
            />
            <div>
              <input 
                disabled
                type="checkbox" 
                id="css" 
                name="dateObj" 
                value={!(dateObj.fixedTime)} 
                checked={ dateObj.fixedTime} 
                onChange={(e) => handleChange(e, "fixedTime")} 
              /> {" "}
              <label for="css">
                Enable rewards only for a particular time of the day. If not
                selected then reward will be be open all day.
              </label>
            </div>
            <div className="dateDiv">
              <h4>Time</h4>
                <div>
                  <TimePicker
                    disabled
                    onChange={(e) => setTime(e, 'startTime')}
                    name= 'startTime'
                    type= "startTime"
                    value={dateObj.startTime}
                  />
                </div>
              <div>
                  <TimePicker
                    disabled
                    onChange={(e) => setTime(e, 'endTime')}
                    name= 'endTime'
                    type= "endTime"
                    value={dateObj.endTime}
                  />
                </div>
            </div>
            <div className="dateDiv">
              <h4>Repeat Every</h4>
              <input 
                disabled
                type="number" 
                onChange={(e) => handleChange(e, "repeatInterval")} 
                value= {dateObj.repeatInterval}
                placeholder="1" 
                className="input" 
              />
              <select disabled>
                <option value="week" selected>Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <h4>Repeat on</h4>
            <div className="dateDiv">
              {
                Object.keys(dateObj.selectedDays).map(item =>{
                  return (
                    <SelectedDays 
                      name = {dateObj.selectedDays[item].short}
                      selected = {dateObj.selectedDays[item].selected}
                      handleChange= {handleChange}
                      camelName = {dateObj.selectedDays[item].camelName}
                    />
                  )
                })
              }
            </div>
            <div style={{ marginTop: "2rem" }}>
            <input 
              disabled
              type="checkbox" 
              name="sendMessage"
              value={!message.sendMessage}
              checked={ message.sendMessage}
              onChange={(e) => {console.log(message);handleChange(e, "sendMessage")}} 
            /> {" "}
              <label for="html">
                Send notifications about rewards to eligible members
              </label>
            </div>
            <div className="text">
              <h4>Message to be sent</h4>
              <textarea
                disabled
                className="input"
                cols="30"
                rows="10"
                placeholder="Text"
                value = {message.messageToSend}
                onChange = {(e) => handleChange(e, "messageToSend")}
              ></textarea>
              {/* <p style={{ color: "#c4c4c4" }}>Helper text</p> */}
            </div>
          </div>
          <br />
          <div className="middle">
            <Button
              onClick={Previous}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              class="button"
            >
              Previous
            </Button>

            <Button
              onClick={Continue}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              class="button"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default PersonalDetails;
