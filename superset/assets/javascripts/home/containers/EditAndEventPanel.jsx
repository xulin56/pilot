import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import { createSelector } from 'reselect';
import { EditList, EventList } from "../components";

const _ = require('lodash');

class EditAndEventPanel extends Component {
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
                            <i className="icon more-icon"></i>
                        </div>
                    </div>
                    <div className="edit-list">
                        {<EditList {...editList} catagory={selected} />}
                    </div>
                </div>
                <div className="event white-bg-and-border-radius">
                    <div className="index-title-module">
                        <h3>事件</h3>
                        <div className="more">
                            <i className="icon more-icon"></i>
                        </div>
                    </div>
                    <div className="event-list">
                        {<EventList eventList={eventList} />}
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
            return {};
        }

        let result = {};
        let item =  {};
        let dataArr = [];
        _.forEach(data, (arr, key) => {
            result[key] = {};
            dataArr = [];
            _.forEach( arr, (obj, key) => {
                item = {
                    'key': key + 1,
                    'name': obj.name,
                    'action': obj.action,
                    'time': obj.time,
                    'link': obj.link
                };
                dataArr.push(item);
            });
            result[key] = dataArr;
        });

        return result;
    }
);

const getEventListData = createSelector(
    state => state.posts.param.actions,
    (data) => {
        if (!data) {
            return [];
        }

        let result = [];
        let item = {};
        _.forEach(data, (obj, key) => {
            item = {
                'key': key + 1,
                'user': obj.user,
                'action': obj.action,
                'time': obj.time,
                'link': obj.link,
                'title': obj.title,
                'type': obj.type
            };
            result.push(item);
        });

        return result;
    }
);

EditAndEventPanel.propTypes = {
    currentCatagory: PropTypes.string.isRequired,
    editList: PropTypes.object,
    eventList: PropTypes.array
}


const mapStateToProps = (state) => {
    const { switcher, posts } = state;
    return {
        currentCatagory: switcher.editPanelCatagory,
        editList: getEidtListData(state),
        eventList: getEventListData(state)
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

export default connect(mapStateToProps, mapDispatchToProps)(EditAndEventPanel);