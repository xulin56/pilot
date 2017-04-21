import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-bootstrap';
import Helmet from 'react-helmet';
import { Line, Table } from '../../components/home';

class Statistic extends Component { // eslint-disable-line
  render() {
    const styles = require('./Statistic.scss');    
    return (
      <div className={styles.statistic}>
        <Helmet title="统计"/>
        <Grid>
          <Row>
            <Col xs={6} md={11}>
              <Line {...this.props}/>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Statistic;
