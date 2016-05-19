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
        Welcome! {this.props.user.username}
        <button onClick={::this.logout}>logout</button>
      </div>
    );
  }
}
