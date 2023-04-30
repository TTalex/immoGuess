const fetchData = async () => {
    const data = await fetch('/api')
    return await data.json()
}
const fetchNewData = async (type) => {
    const data = await fetch(`/getNewData/${type}`)
    return await data.json()
}
const RealEstateAdPhoto = ({photo}) => {
    return (
        <div className="column is-one-third text-center">
            <a href={photo.url_photo} target="_blank" rel="noreferrer"><img src={photo.url_photo}></img></a>
        </div>
    )
}
const RealEstateAd = ({realEstateAd}) => {
    const [startIndex, setStartIndex] = React.useState(0)
    React.useEffect(() => {
        setStartIndex(0)
    }, [realEstateAd])
    return (
        <div className="box">
            <h4 className="title is-4">{realEstateAd.title}</h4>
            <div className="field is-grouped is-grouped-multiline">
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">💰 Type</span>
                            <span className="tag is-info">{realEstateAd.transactionType === 'buy' ? 'Vente' : 'Location'}</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">🏙️ Lieu</span>
                            <span className="tag is-info">{realEstateAd.city} ({realEstateAd.postalCode})</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">📏 Surface</span>
                            <span className="tag is-info">{realEstateAd.surfaceArea}m²</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">🚪 Pièce(s)</span>
                            <span className="tag is-info">{realEstateAd.roomsQuantity}</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">🛗 Etage(s)</span>
                            <span className="tag is-info">{realEstateAd.floor === undefined ? 'non précisé' : realEstateAd.floor}</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">⚡ Classif énergétique</span>
                            <span className="tag is-info">{realEstateAd.energyClassification}</span>
                        </div>
                    </div>
                    <div className="control">
                        <div className="tags has-addons">
                            <span className="tag is-dark">📅 Date de l'annonce</span>
                            <span className="tag is-info">{new Date(realEstateAd.publicationDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    
            </div>
            <div className="columns">
                {realEstateAd.photos.slice(startIndex, startIndex+3).map((photo, index) => <RealEstateAdPhoto photo={photo} key={index}></RealEstateAdPhoto>)}
            </div>
            <div className="text-center">
                <button className="button is-info" disabled={startIndex <= 0} onClick={() => setStartIndex(startIndex - 3)} style={{marginRight: '10px'}}><b>{'<'}</b></button>
                <button className="button is-info" disabled={realEstateAd.photos.length <= startIndex + 3} onClick={() => setStartIndex(startIndex + 3)}><b>{'>'}</b></button>
            </div>
        </div>
    )
}
const Nav = () => {
    const [isActive, setIsActive] = React.useState(false)
    const fetchAndReload = async (type) => {
        await fetchNewData(type)
        window.location.reload(false)
    }
    return (
        <nav className="navbar is-info" role="navigation" aria-label="dropdown navigation">
            <div className="navbar-brand">
                <div className="navbar-item">
                    <h1 className="title" style={{color: 'white'}}>ImmoGuess</h1>
                </div>
            </div>
            <div className="navbar-menu">
                <div className="navbar-end">
                    <div className={`navbar-item has-dropdown ${isActive ? 'is-active' : ''}`}>
                        <a className="navbar-link" onClick={() => setIsActive(!isActive)}>
                            Admin
                        </a>
                        <div className="navbar-dropdown is-right">
                            <a className="navbar-item" onClick={() => fetchAndReload('rent')}>
                                Fetch new rent data
                            </a>
                            <a className="navbar-item" onClick={() => fetchAndReload('buy')}>
                                Fetch new buy data
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
const App = () => {
    const [data, setData] = React.useState()
    const [guess, setGuess] = React.useState('')
    const [randomEstateAd, setRandomEstateAd] = React.useState()
    const [result, setResult] = React.useState(false)
    const [score, setScore] = React.useState({
        total: 0,
        numberOfGuesses: 0,
        best: 0
    })
    React.useEffect(() => {
        const _fetch = async () => {
            const fetched = await fetchData()
            console.log(fetched)
            setData(fetched)
            setRandomEstateAd(fetched.realEstateAds[Math.floor(Math.random() * fetched.realEstateAds.length)])
        }
        _fetch()
    }, [])
    const next = () => {
        setRandomEstateAd(data.realEstateAds[Math.floor(Math.random() * data.realEstateAds.length)])
        setResult(false)
        setGuess('')
    }
    const computePoints = (_price, _guess) => {
        const diff = Math.abs(_guess - _price)
        const factor = Math.pow(10, Math.round(_price).toString().length - 1)
        const score = Math.round(1/Math.exp(diff/factor) * 100)
        return score
    }
    const guessTrigger = () => {
        const score = computePoints(randomEstateAd.price, guess)
        setScore(prevScore => {
            return {
                total: prevScore.total + score,
                numberOfGuesses: prevScore.numberOfGuesses + 1,
                best: Math.max(prevScore.best, score)
            }
        })
        setResult(score)
    }
    return (
        <div className="main">
            <Nav />
            <section className="section">
                <div className="container">
                    <p className="subtitle">
                        Tours: {score.numberOfGuesses}, Score moyen: {score.total / score.numberOfGuesses || 0}/100, Meilleur score: {score.best}/100
                    </p>
                    <div>
                        {randomEstateAd && <RealEstateAd realEstateAd={randomEstateAd}></RealEstateAd>}
                    </div>
                    
                </div>
            </section>
            <section className="section" style={{paddingTop: '0px'}}>
                <div className="container">
                    <h3 className="title is-3">
                        Il est temps de deviner le prix
                    </h3>
                    {result !== false ?
                        <div>
                            <p>
                                Le prix réel est {randomEstateAd.price}, le prix deviné est {guess}, vous recevez {computePoints(randomEstateAd.price, guess)} points.
                                (<a href={`https://www.bienici.com/annonce/${randomEstateAd.id}`} target='_blank'  rel="noreferrer">Lien</a>)
                            </p>
                            <br />
                            <button className="button is-info" onClick={() => next()}>
                                Continuer
                            </button>
                        </div>
                    : <form>
                        <div className="field is-grouped">
                            <p className="control is-expanded">
                                <input className="input" type="text" placeholder="Entrer un prix (mensuel pour les locations, total pour les ventes)" value={guess} onChange={e => setGuess(e.target.value)}/>
                            </p>
                            <p className="control">
                                <input type="submit" className="button is-info" value="Deviner" onClick={guessTrigger}></input>
                            </p>
                        </div>
                    </form>}
                </div>
            </section>
        </div>
    )
}

const domContainer = document.getElementById('root')
const root = ReactDOM.createRoot(domContainer)
root.render(<App />)