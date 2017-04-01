import React from 'react';
import Button from 'uxcore/lib/Button';
import Dialog from 'uxcore/lib/Dialog';
import brace from 'brace';
require('brace/mode/jsx');
require('brace/mode/javascript');
require('brace/theme/github');


import DemoItem from './DemoItem';
import { transformCode } from '../../../utils';


export default class Demo extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
      selectDemoIndex: 0,
      demos: this.sortDemos(props.demos),
      dialog: {
      	title: '',
      	content: ''
      },
      showDialog: false
    };

    this.toggleFrame = this.toggleFrame.bind(this);
    this.transform = this.transform.bind(this);
    this.showExpandDemo = this.showExpandDemo.bind(this);
    this.hideDialog = this.hideDialog.bind(this);
	}

	componentWillReceiveProps(next){
		if(next.params != this.state.params){
			this.setState({
				selectDemoIndex: -1,
				demos: this.sortDemos(next.demos)
			}, () =>{
				window.setTimeout(() => {
					this.transform(this.state.demos[0]);
				}, 1000)
			})
		}
	}

	componentDidMount(){
		const { demos, selectDemoIndex } = this.state;

		window.setTimeout(() => {
			// this.transform(demos[selectDemoIndex].content, demos[selectDemoIndex].style);
			this.transform(demos[selectDemoIndex]);
		}, 3000)
	}

	sortDemos(demos){
		let arr = Object.keys(demos).map(name => {
			const old = demos[name];
			const obj = {
				name,
				meta: old.meta,
				highlightedCode: old.highlightedCode,
				content: old.content[1][2][1]
			};

			if(old.content.length === 3 ){
				obj.style = {
					highlightedCode: old.content[2],
					content: old.content[2][2][1]
				}
			}

			return obj;
		});

		return arr.sort((a, b) => a.meta.order - b.meta.order);
	}

	transform(data){
		const { code, err } = transformCode(data.content);
		const { demos } = this.state;
		if(!err){
			this.container.contentWindow.postMessage({
				code, 
				style: data.style ? data.style.content : null
			}, '*');
		}	
	}

	toggleFrame(index){
		const { selectDemoIndex, demos } = this.state;

		if(selectDemoIndex != index){
			window.setTimeout(() => {
				this.transform(demos[index]);
			}, 1000)

			this.setState({
				selectDemoIndex: index
			});
			
		}
	}

	showExpandDemo(dialog){
		this.setState({
			dialog,
			showDialog: true
		})
	}

	hideDialog(){
		this.setState({
			showDialog: false
		})
	}

	render(){
		const { selectDemoIndex, demos, dialog, showDialog } = this.state;
		const { params, utils } = this.props;

		const selectDemo = demos[selectDemoIndex > -1 ? selectDemoIndex : 0];
		const isLocalMode = window.location.port;
		const protocol = window.location.protocol;
		const host = isLocalMode ? 'localhost:8004' : window.location.host;
		const demoUrl = isLocalMode 
			? `${protocol}//${host}/demos/${params}/${selectDemo.name}/` 
			: `${protocol}//${host}/mobile/demos/${params}/${selectDemo.name}`;
		return (
			<div className="demo-wrapper">
				<div className="preview-wrapper">
					<div className="preview-header">
						<div className="preview-statbar">
							<img src="https://os.alipayobjects.com/rmsportal/VfVHYcSUxreetec.png" width="350" alt=""/>
						</div>
						<div className="preview-navbar">
            	<div className="preview-url">{`/demos/${params}/${selectDemo.name}`}</div>
            </div>
					</div>
					<div className="preview-content">
						<iframe 
							src={demoUrl} 
							ref = {e => {
		            this.container = e;
		          }}
							/>
					</div>
				</div>
				<div className="demo-card-wrap">
					{
						demos.map((demo, i) => 
							<DemoItem 
								key={demo.name} 
								data={demo} 
								index={i} 
								selectIndex={selectDemoIndex}
								transform={this.transform}
								showExpandDemo={this.showExpandDemo}
								toggleFrame={this.toggleFrame}
								utils={utils}
							/>
						)
					}
				</div>
				<Dialog title={dialog.title}
          visible={showDialog}
          closable={true}
          onCancel={this.hideDialog}
          width={900}
          footer={<Button type="primary" onClick={e => this.hideDialog()}>Back</Button>}
          className='demo-dialog'
          >
         	 {utils.toReactComponent(dialog.content)}
         	 
         	 {dialog.style && utils.toReactComponent(dialog.style)}
        </Dialog>
			</div>
		)
	}
}

