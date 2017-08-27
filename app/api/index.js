// Axios
import Axios from 'axios'

export const getReleaseData = async (user, repo) => {
    const api = `https://api.github.com/repos/${user}/${repo}/releases`
    return Axios.get(api)
}