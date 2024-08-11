// src/components/ErrorBoundary.js
import React, { Component } from 'react';
import { Spinner } from 'react-bootstrap'; // Or any spinner component of your choice
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure bootstrap CSS is included

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isLoading: true };
  }

  static getDerivedStateFromError() {
    // Update state to indicate an error has occurred
    return { hasError: true, isLoading: false };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    console.error('Error:', error);
    console.error('Info:', info);
  }

  componentDidMount() {
    // Simulate loading time
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1000); // Adjust the time as needed
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner animation="border" />;
    }

    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
