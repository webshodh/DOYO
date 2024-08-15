import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { colors } from "../../theme/theme";

const WelcomeScreen = () => {
  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ backgroundColor: colors.Orange, minHeight: "100vh" }}
    >
      <Row className="text-center">
        <Col>
          <div className="p-5 text-white">
            <img src="/logo.png" width={"400px"} />

            <h1 className="mt-3">Welcome!</h1>
            <p className="lead">
              We're thrilled to have you here. Start exploring our menu and
              enjoy your meal!
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WelcomeScreen;
