import React,{ Component } from 'react';
import { Message } from 'semantic-ui-react';

export default class DismissableAlert extends Component {
  constructor(props) { 
    super(props); 
  }

  state = { visible: true }

  handleDismiss = () => {
    this.setState({ visible: false })
  }

  render() {
    const color = this.props.success && 'olive' || this.props.error && 'red' || null;
    if (this.state.visible) {
      return (
        <Message
          color={color}
          onDismiss={this.handleDismiss}
          header={this.props.header}
          content={this.props.content}
        />
      )
    }
    return null;
  }
}
