import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import { createSelector } from 'reselect';
import { EditList, EventList } from "../components";

const _ = require('lodash');

class EditAndEvent extends Component {
    constructor(props) {
        super();
    }

    render() {
        let selected = this.props.currentCatagory || "dashboard";
        const { onChangeCatagory, editList, eventList } = this.props;

        return (
            <aside className="recentedit-and-event">
                <div className="recentedit white-bg-and-border-radius">
                    <div className="index-title-module">
                        <h3>最近编辑 </h3>
                        <div className="title-tab">
                            <ul onClick={ () => {} }>
                                <li onClick={ () => {onChangeCatagory('dashboard')} } className={selected==='slice'?'':'current'}>仪表板</li>
                                <li onClick={ () => {onChangeCatagory('slice')} } className={selected==='slice'?'current':''}>工作表</li>
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
                        {<EditList {...editList} catagory={selected} />}
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
                        {<EventList {...eventList} />}
                    </div>
                </div>
            </aside>
        );
    }
}

const getEidtListData = createSelector(
    state => state.posts.param.edits,
    (data) => {
        if (!data) {
            return "";
        }

        let result = {};
        let item =  {};
        let dataArr = [];
        _.forEach(data, (arr, key) => {
            result[key] = {};

            _.forEach( arr, (obj, key) => {
                item = {
                    'name': obj.link,
                    'time': obj.time
                };
                dataArr.push(item);
            });
            result[key] = dataArr;
        });

        return result;
    }
);

EditAndEvent.propTypes = {
    currentCatagory: PropTypes.any.isRequired,
    editList: PropTypes.any.isRequired,
    eventList: PropTypes.any.isRequired
}


const mapStateToProps = (state) => {
    const { switcher, posts } = state;
    return {
        currentCatagory: switcher.editPanelCatagory,
        editList: getEidtListData(state),
        eventList: posts.param.actions || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeCatagory: (catagory) => {
            dispatch({
                type: "SWITCH_TAB_IN_EDIT",
                tab: catagory
            });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditAndEvent);