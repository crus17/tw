const got =  require('got')

exports.sporty = async (ticketId)=> {

    const url = `https://www.sportybet.com/api/ng/orders/share/${ticketId.toUpperCase()}`;
    
    const response = await got.get(url).json();

    if(response.innerMsg === "Invalid"){
        throw new Error("The code is invalid.")
    }

    let games;

    try {
            games = response.data.outcomes.map((game)=>({
                league: `${game.sport.category.name}, ${game.sport.category.tournament.name}`,
                time: game.estimateStartTime,
                homeTeam: game.homeTeamName,
                awayTeam: game.awayTeamName,
                scores: !(game.status > 2 || game.matchStatus==='Ended' || game.matchStatus==='AP')? {ft:"",ht:""}:{ht: game.gameScore?.[0], ft: game.setScore},
                prediction: game.markets[0].outcomes[0].desc,
                market: game.markets[0].desc,
                outcome: game.markets[0].outcomes[0].isWinning,
                odds: game.markets[0].outcomes[0].odds,
                matchStatus: game.matchStatus,
                status: game.status,
            }))
        
    } catch (error) {
        throw new Error()
    }

    return games;
}