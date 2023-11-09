import React, {Component} from 'react'
import {connect} from 'react-redux'
import {push} from 'connected-react-router'
import * as actions from '../../store/actions'
import './Login.scss'
import {FormattedMessage} from 'react-intl'
import {handleLoginApi} from '../../services/userService'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      isShowPassword: false,
      errMessage: ''
    }
  }

  handleOnChangeInputUsername = (event) => {
    this.setState({
      username: event.target.value
    })
  }

  handleOnChangeInputPassword = (event) => {
    this.setState({
      password: event.target.value
    })
  }

  handleLogin = async () => {
    this.setState({
      errMessage: ''
    })

    try {
      let data = await handleLoginApi(this.state.username, this.state.password)
      if (data && data.errCode !== 0) {
        this.setState({
          errMessage: data.message
        })
      }
      if (data && data.errCode === 0) {
        this.props.userLoginSuccess(data.user)
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          this.setState({
            errMessage: error.response.data.message
          })
        }
      }
    }
  }

  handleShowHidePassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword
    })
  }

  render() {
    // JSX
    return (
      <div className="login-background">
        <div className="login-container">
          <div className="login-content row">
            <div className="col-12 text-login">Login to PetCung</div>
            <div className="col-12 form-group login-input">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                value={this.state.username}
                onChange={(event) => this.handleOnChangeInputUsername(event)}
              />
            </div>

            <div className="col-12 form-group login-input">
              <label>Password</label>
              <div className="custom-input-password">
                <input
                  type={this.state.isShowPassword ? 'text' : 'password'}
                  className="form-control"
                  value={this.state.password}
                  onChange={(event) => this.handleOnChangeInputPassword(event)}
                />
                <span onClick={() => this.handleShowHidePassword()}>
                  <i
                    class={
                      this.state.isShowPassword
                        ? 'fa-regular fa-eye'
                        : 'fa-regular fa-eye-slash'
                    }
                  ></i>
                </span>
              </div>
            </div>

            <div className="col-12" style={{color: 'red'}}>
              {this.state.errMessage}
            </div>

            <div className="col-12">
              <button className="btn-login" onClick={() => this.handleLogin()}>
                Login
              </button>
            </div>

            <div className="col-12">
              <span className="forgot-password">Forgot password?</span>
            </div>

            <div className="col-12 text-center mt-3">
              <span className="text-other-login">Or Login with</span>
            </div>

            <div className="col-12 social-login">
              <i className="fa-brands fa-facebook-f facebook"></i>
              <i className="fa-brands fa-google google"></i>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
    userLoginSuccess: (userInfo) =>
      dispatch(actions.userLoginSuccess(userInfo)),
    userLoginFail: () => dispatch(actions.userLoginFail())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
