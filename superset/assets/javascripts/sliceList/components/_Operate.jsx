import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

const propTypes = {
  //dataEndpoint: React.PropTypes.string.isRequired,
  //onChange: React.PropTypes.func.isRequired
};

const defaultProps = {
  placeholder: 'Select ...',
  valueRenderer: (o) => (<div>{o.label}</div>),
};

function Tr(props) {
  return (
    <tr>
        <td>
            <input id="38" className="action_check responsive-checkbox" name="rowid" value="38" type="checkbox" />
        </td>
        <td>
            <a href="/superset/explore/table/6/?flt_col_0=&amp;add_to_dash=false&amp;subdomain_granularity=day&amp;goto_dash=false&amp;datasource_id=6&amp;new_slice_name=admin_s1&amp;save_to_dashboard_id=&amp;flt_eq_0=&amp;json=false&amp;until=now&amp;userid=1&amp;time_grain_sqla=Time+Column&amp;metric=count&amp;slice_id=38&amp;datasource_name=multiformat_time_series&amp;having=&amp;since=1+year+ago&amp;new_dashboard_name=&amp;viz_type=cal_heatmap&amp;collapsed_fieldsets=&amp;datasource_type=table&amp;domain_granularity=month&amp;slice_name=admin_s1&amp;where=&amp;granularity_sqla=ds&amp;rdo_save=saveas&amp;flt_op_0=in" data-original-title="" title="">admin_s1</a>
        </td>
        <td>
            cal_heatmap
        </td>
        <td>
            <a href="/superset/explore/table/6/" data-original-title="" title="">multiformat_time_series</a>
        </td>
        <td>
            <a href="/superset/profile/admin/" data-original-title="" title="">a a</a>
        </td>
        <td>
            False
        </td>
        <td>
            <span className="no-wrap">11 hours ago</span>
        </td>
        <td className="">
            <center>
                <div className="btn-group btn-group-xs" style={{display:'flex'}}>
                    <a href="/slicemodelview/show/38" className="btn btn-sm btn-primary" data-toggle="tooltip" rel="tooltip" title="" data-original-title="显示记录">
                        <i className="fa fa-search"></i>
                    </a>
                    <a href="/slicemodelview/edit/38" className="btn btn-sm btn-primary" data-toggle="tooltip" rel="tooltip" title="" data-original-title="编辑记录">
                        <i className="fa fa-edit"></i>
                    </a>
                    <a data-text="您确定要删除这条记录吗？" data-href="/slicemodelview/delete/38" className="btn btn-sm btn-primary confirm" rel="tooltip" title="" data-toggle="modal" data-target="#modal-confirm" href="#" data-original-title="删除记录">
                        <i className="fa fa-eraser"></i>
                    </a>
                </div>
            </center>
        </td>
    </tr>
  );
}
Tr.propTypes = {
  //text: PropTypes.string.isRequired,
  //color: PropTypes.string.isRequired
};

class Operate extends Component {
  componentDidMount() {
    // this.fetchOptions();
  }
  fetchOptions() {
    /*
    this.setState({ isLoading: true });
    const mutator = this.props.mutator;
    this.props.data.map((data) => {
      this.setState({ options: mutator ? mutator(data) : data, isLoading: false });
    });
    */
  }
  //when filter value changes
  onChange(opt) {
    this.props.onChange(opt);
  }
  render() {
    console.log( 'props:', this.props);

    const list = [
        { text: 'Hello 1' },
        { text: 'Hello 2' }
    ];
    const children = list.map((li, key) =>
        <Tr key={key} text={li.text} />
    );
    return (
        <table className="responsive-title">
            <thead>
                <tr>
                    <th className="action-checkbox">
                        <input id="check_all" className="action_check_all responsive-checkbox" name="check_all" type="checkbox" />
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=slice_link" data-original-title="" title="">
                            工作表<i className="fa fa-arrows-v pull-right"></i></a>
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=viz_type" data-original-title="" title="">
                            图表类型<i className="fa fa-arrows-v pull-right"></i>
                        </a>
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=datasource_link" data-original-title="" title="">
                            数据集<i className="fa fa-arrows-v pull-right"></i>
                        </a>
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=creator" data-original-title="" title="">
                            创建者<i className="fa fa-arrows-v pull-right"></i>
                        </a>
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=online" data-original-title="" title="">
                            Online<i className="fa fa-arrows-v pull-right"></i>
                        </a>
                    </th>
                    <th>
                        <a href="/slicemodelview/list/?_od_SliceModelView=asc&amp;_oc_SliceModelView=modified" data-original-title="" title="">
                            最后修改<i className="fa fa-arrows-v pull-right"></i>
                        </a>
                    </th>
                    <th className="col-md-1 col-lg-1 col-sm-1"></th>
                </tr>
            </thead>
            <tbody>
                {children}
            </tbody>
        </table>
    );
  }
}

Operate.propTypes = propTypes;
Operate.defaultProps = defaultProps;

export default Operate;


