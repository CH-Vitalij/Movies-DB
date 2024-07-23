import { Component } from 'react';
import { Alert, Button, Popover } from 'antd';

export default class ErrorMessage extends Component {
  render() {
    return (
      <Alert
        message="Woops... Something went wrong, try again later"
        showIcon
        closable={true}
        type="error"
        action={
          <Popover content={this.props.errorDetail.toString()}>
            <Button size="small" danger>
              Detail
            </Button>
          </Popover>
        }
      />
    );
  }
}
