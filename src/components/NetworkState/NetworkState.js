import { Alert, Modal } from 'antd';
import { Component } from 'react';

class NetworkState extends Component {
  state = { status: navigator.onLine };

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ status: true });
  };

  handleOffline = () => {
    this.setState({ status: false });
  };

  render() {
    if (this.state.status) {
      return this.props.children;
    } else {
      return (
        <Modal closable={false} footer={null} open={!this.state.status}>
          <Alert message="No Internet Connection. Please try again later" showIcon type="error" />
        </Modal>
      );
    }
  }
}

export default NetworkState;
