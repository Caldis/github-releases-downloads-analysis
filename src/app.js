/**
 * 名称: 应用主入口
 **/

// Libs
import React from 'react'
// Styles
import './app.scss'
import style from './app.module.scss'
// AntMotion
import QueueAnim from 'rc-queue-anim'
// History
import { createBrowserHistory } from 'history'
// QueryString
import queryString from 'query-string'
// MaterialUI
import { Avatar, Button, TextField } from '@material-ui/core'
// Components
import HorizontalScroll from './components/horizontal'
import Card from './components/card'
import Tags from './components/tags'
import BarChart from './components/chart/bar'
import PieChart from './components/chart/pie'
import Github from './components/github'
// Utils
import { disableDragDrop } from './utils/tools'
// Config
import { getReleaseData } from './api'

const history = createBrowserHistory()

class App extends React.Component {
  constructor (props) {
    super(props)

    const search = queryString.parse(history.location.search)

    this.state = {
      showInput: false,
      showAnalysis: false,
      err: '',
      url: search.url || '',
      user: search.user || '',
      repo: search.repo || '',
      data: [],
      since: '',
      totalDownload: 0,
      trendTag: [],
      trendData: [],
      distData: [],
    }
    // 禁止响应全局的文件拖放事件
    disableDragDrop()
    // 查询数据
    this.handleGetUserInput()
  }

  // 获取REPO的数据
  handleGetUserInput = async () => {
    const { url, user, repo } = this.state
    let u, r
    if (url) {
      const sUrl = url.split('/')
      u = sUrl[sUrl.length - 2]
      r = sUrl[sUrl.length - 1]
      await this.handleGetReleaseData(u, r)
      history.push(url ? `/?url=${url}` : `/?user=${user}&repo=${repo}`)
    } else if (user && repo) {
      u = user
      r = repo
      await this.handleGetReleaseData(u, r)
      history.push(url ? `/?url=${url}` : `/?user=${user}&repo=${repo}`)
    } else {
      this.setState({
        err: 'No user data input',
      })
    }
  }
  handleGetReleaseData = async (user, repo) => {
    // 将REPO数据取出并排序
    const resp = (await getReleaseData(user, repo))
    if (resp.data.length > 0) {
      const data = resp.data.sort((a, b) =>
        a.created_at === b.created_at ? 0 : a.created_at < b.created_at ? 1 : -1)
      // 最早的时间
      const since = new Date(data[data.length - 1].created_at).Format('yyyy-MM-dd hh:mm:ss')
      // 总下载次数
      const totalDownload = data.reduce((sum, release) =>
        sum + this.downloadOfAssets(release.assets), 0)
      // 趋势
      const trendTag = data.map(release => release.tag_name)
      const trendData = data.map(release => this.downloadOfAssets(release.assets))
      // 分布
      const distData = data.map(release => ({
        value: this.downloadOfAssets(release.assets),
        name: release.tag_name,
      }))
      this.setState({
        showInput: true,
        showAnalysis: true,
        user,
        repo,
        data,
        since,
        totalDownload,
        trendTag,
        trendData,
        distData,
      })
    } else {
      this.setState({
        err: 'No release',
      })
    }
  }
  downloadOfAssets = (assets) => {
    return assets.reduce((sum, asset) => sum + asset.download_count, 0)
  }

  // 构建版本卡片
  buildVersionCards = () => {
    const { data } = this.state
    return data.sort((a, b) => a.tag_name === b.tag_name ? 0 : a.tag_name < b.tag_name ? 1 : -1).map((release, index) =>
      <Card key={index}>
        <div className={style.title}>
          <h2>{release.tag_name}</h2>
          <a href={release.html_url}>Detail ></a>
        </div>
        <div className={style.info}>
          <p>Create at: {new Date(release.created_at).Format('yyyy-MM-dd hh:mm:ss')}</p>
          <p>Publish at: {new Date(release.published_at).Format('yyyy-MM-dd hh:mm:ss')}</p>
        </div>
        <div className={style.author}>
          <Avatar alt={release.author.login} src={release.author.avatar_url}/>
          <a href={release.author.html_url}>{release.author.login}</a>
        </div>
      </Card>,
    )
  }

  render () {
    const {
      showInput,
      showAnalysis,
      url,
      user,
      repo,
      data,
      since,
      totalDownload,
      trendTag,
      trendData,
      distData,
    } = this.state
    return (
      <div className={style.app}>

        {/*项目链接*/}
        <div className={style.floatButton}>
          <Github/>
        </div>

        {/*落地题图*/}
        <QueueAnim className={style.bannerContainer} type="bottom" duration={[350, 0]}>
          {
            !showInput ?
              <div className={style.introContainer} key={1}>
                {/*用户引导*/}
                <h1>Analysis your repo's releases state on Github</h1>
                <div>
                  <Button variant="contained" color="primary" onClick={() => this.setState({ showInput: true })}>
                    Start
                  </Button>
                </div>
              </div> :
              <div className={style.input} key={2}>
                {/*用户输入*/}
                <p>Input the target</p>
                <div className={style.sep}>
                  <TextField
                    label="USER"
                    style={{ width: '50%' }}
                    value={user}
                    onChange={e => this.setState({ user: e.target.value })}
                  />
                  <TextField
                    label="REPO"
                    style={{ width: '50%' }}
                    value={repo}
                    onChange={e => this.setState({ repo: e.target.value })}
                  />
                </div>
                <p>Or url of repo</p>
                <div className={style.url}>
                  <TextField
                    label="URL"
                    style={{ width: '100%' }}
                    value={url}
                    onChange={e => this.setState({ url: e.target.value })}
                  />
                </div>
                <p>Then</p>
                <Button variant="contained" color="primary" onClick={this.handleGetUserInput}>
                  Analysis
                </Button>
              </div>
          }
        </QueueAnim>

        {/*内容*/}
        <QueueAnim className={style.contentContainer} type="bottom">
          {
            showAnalysis &&
            <div key={1}>
              {/*结果统计*/}
              <Card className={style.analysis}>
                <section>
                  <h1 className={style.title}>
                    Project {repo}
                  </h1>
                </section>
                <section>
                  <h1>Total Download</h1>
                  <Tags title={`Since ${since}`} data={totalDownload} tail="times"/>
                </section>
                <section>
                  <h1>Download Trend</h1>
                  <BarChart tag={trendTag} data={trendData}/>
                </section>
                <section>
                  <h1>Download Distribution of Versions</h1>
                  <PieChart data={distData}/>
                </section>
              </Card>

              {/*各版本详情*/}
              <div className={style.versions}>
                <p>Versions Info</p>
                <div className={style.horizontalWrapper}>
                  {
                    data.length > 0 &&
                    <HorizontalScroll style={{ height: 230 }}>
                      <div className={style.cardWrapper}>
                        {this.buildVersionCards()}
                      </div>
                    </HorizontalScroll>
                  }
                </div>
                <div className={style.cardOverlayLeft}/>
                <div className={style.cardOverlayRight}/>
              </div>

              {/*页脚*/}
              <div className={style.footer}>
                <p>Designed & Made by Caldis, Power by React</p>
                <Github/>
              </div>
            </div>
          }
        </QueueAnim>

      </div>
    )
  }
}

export default App
