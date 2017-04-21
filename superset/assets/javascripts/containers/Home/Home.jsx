import React, { Component, PropTypes } from 'react';
import { Line, EditList, EventList } from '../../components/home';

class Home extends Component { // eslint-disable-line

  constructor(props) {
    super(props);
    this.state = {
      current: 'dashboard' //'slices'
    };

    //this.switchLatestEdits = this.switchLatestEdits.bind(this);
  }

  render() {

    const { param, current, switchLatestEdits } = this.props;
    let counts = param.counts;
    param.current = current;

    return (
      <div>
        <aside className="data-tendency white-bg-and-border-radius">
          <hgroup className="data-title">
            <h2 className="current">
                <dl>
                    <dt>
                        <svg>
                            {/*<use xlink:href="#analysis"></use>*/}
                        </svg>
                        <span>{counts.dashboard}</span>
                    </dt>
                    <dd>仪表盘</dd>
                </dl>
            </h2>
            <h2>
                <dl>
                    <dt>
                        <svg>
                            {/*<use xlink:href="#analysis"></use>*/}
                        </svg>
                        <span>{counts.database}</span>
                    </dt>
                    <dd>工作表</dd>
                </dl>
            </h2>
            <h2>
                <dl>
                    <dt>
                        <svg>
                            {/*<use xlink:href="#analysis"></use>*/}
                        </svg>
                        <span>{counts.slice}</span>
                    </dt>
                    <dd>连接</dd>
                </dl>
            </h2>
            <h2>
                <dl>
                    <dt>
                        <svg>
                            {/*<use xlink:href="#analysis"></use>*/}
                        </svg>
                        <span>{counts.table}</span>
                    </dt>
                    <dd>数据集</dd>
                </dl>
            </h2>
          </hgroup>
          <div className="dashboard-linechart" style={{background:'transparent'}}>
            <Line {...param}/>
          </div>
        </aside>
        <aside className="top10-and-worktimes">
          <div className="top10 white-bg-and-border-radius">
            <div className="index-title-module">
              <h3>收藏次数top10</h3>
              <div className="title-tab">
                <ul>
                  <li className="current">仪表板</li>
                  <li>工作表</li>
                </ul>
              </div> 
              <div className="transparent"></div>
            </div>
            <div className="times-barchart" style={{background:'transparent'}}>
                这里是条形图
            </div>
          </div>
          <div className="worktimes white-bg-and-border-radius">
            <div className="index-title-module">
              <h3>引用次数top10</h3>
            </div>
            <div className="times-barchart" style={{background:'transparent'}}>
              这里是条形图
            </div>
          </div>
        </aside>
        <aside className="recentedit-and-event">
          <div className="recentedit white-bg-and-border-radius">
              <div className="index-title-module">
                <h3>最近编辑 </h3>
                <div className="title-tab">
                  <ul onClick={ () => {
                    return switchLatestEdits({
                      type: current
                    })
                  } }>
                      <li className={this.props.current==='slice'?'':'current'}>仪表板</li>
                      <li className={this.props.current==='slice'?'current':''}>工作表</li>
                  </ul>
                </div> 
                <div className="more">
                    <svg>
                        {/*<use xlink:href="#search"></use>*/}
                    </svg>
                </div>
              </div>
              <div className="edit-list">
                <ul>
                  <li>
                      <span>名称</span>
                  </li>
                  <li>
                      <span>操作</span>
                      <svg>
                          {/*<use xlink:href="#sort"></use>*/}
                      </svg>
                  </li>
                  <li>
                      <span>编辑时间</span>
                      <svg>
                          {/*<use xlink:href="#sort"></use>*/}
                      </svg>
                  </li>
                </ul>
                {<EditList {...param} />}
              </div>
            </div>
            <div className="event white-bg-and-border-radius">
              <div className="index-title-module">
                  <h3>事件</h3>
                  <div className="more">
                      <svg>
                          {/*<use xlink:href="#search"></use>*/}
                      </svg>
                  </div>
              </div>
              <div className="event-list">
                {<EventList {...param} />}
              </div>
            </div>
        </aside>
      </div>
    );
  }
}

Home.propTypes = {
  current: PropTypes.string.isRequired,
  param: PropTypes.any.isRequired
}

export default Home;