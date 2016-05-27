import React, { Component, PropTypes } from 'react';
import { observer } from '../../src';

@observer('user')
export default class UserDetail extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
  }
  logout() {
    this.props.user.logout();
  }
  render() {
    return (
      <div className="container">
        <div>
          Welcome! {this.props.user.username}
        </div>
        <ul>
          <li><label>FROM: </label>{this.props.user.from}</li>
          <li><label>HABITS: </label>{this.props.user.habits}</li>
        </ul>
        <button onClick={::this.logout}>logout</button>
      </div>
    );
  }
}
