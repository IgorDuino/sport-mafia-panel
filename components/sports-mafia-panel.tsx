'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shuffle, Star, CircleDot, User, Axe, Play, Pause, RotateCcw } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

type Player = {
  id: number
  nickname: string
  role: 'mafia' | 'don' | 'sheriff' | 'peaceful'
  fouls: number
  points: number
  additionalPoints: number
  killed: boolean
  nominated: boolean
  isFirstKilled: boolean
}

type Vote = {
  playerId: number
  votes: number
}

export function SportsMafiaPanelComponent() {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentVoting, setCurrentVoting] = useState<Vote[]>([])
  const [votingHistory, setVotingHistory] = useState<Vote[][]>([])
  const [timer, setTimer] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isVotingActive, setIsVotingActive] = useState(false)
  const [judgeName, setJudgeName] = useState('')
  const [winningTeam, setWinningTeam] = useState<'mafia' | 'city' | null>(null)
  const [firstKilled, setFirstKilled] = useState<string>('')
  const [bestMove, setBestMove] = useState<[number, number, number]>([0, 0, 0])

  useEffect(() => {
    // Initialize 10 players
    const initialPlayers: Player[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      nickname: `Player ${i + 1}`,
      role: 'peaceful',
      fouls: 0,
      points: 1,
      additionalPoints: 0,
      killed: false,
      nominated: false,
      isFirstKilled: false
    }))
    setPlayers(initialPlayers)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timer])

  const distributeRoles = () => {
    const newPlayers = [...players];
    const roles: Player['role'][] = ['don', 'mafia', 'mafia', 'sheriff', 'peaceful', 'peaceful', 'peaceful', 'peaceful', 'peaceful', 'peaceful'];

    // Shuffle the roles array
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // Assign the shuffled roles to players
    newPlayers.forEach((player, index) => {
      player.role = roles[index];
    });

    setPlayers(newPlayers);
  }

  const killPlayer = (playerId: number) => {
    const playerToKill = players.find(p => p.id === playerId);
    if (playerToKill && !playerToKill.killed) {
      const isFirstKill = !players.some(p => p.killed);
      setPlayers(players.map(player =>
        player.id === playerId ? { ...player, killed: true, isFirstKilled: isFirstKill } : player
      ));
      if (isFirstKill) {
        setFirstKilled(playerToKill.nickname);
      }
    } else {
      setPlayers(players.map(player =>
        player.id === playerId ? { ...player, killed: false, isFirstKilled: false } : player
      ));
      if (playerToKill?.isFirstKilled) {
        setFirstKilled('');
        setBestMove([0, 0, 0]);
      }
    }
  }

  const nominatePlayer = (playerId: number) => {
    if (players.find(p => p.id === playerId)?.killed) return

    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, nominated: !player.nominated } : player
    ))

    const nominatedPlayers = players.filter(p => p.nominated || p.id === playerId)
    if (nominatedPlayers.length > 0) {
      startVoting(nominatedPlayers)
    } else {
      setIsVotingActive(false)
      setCurrentVoting([])
    }
  }

  const startVoting = (nominatedPlayers: Player[]) => {
    setCurrentVoting(nominatedPlayers.map(player => ({ playerId: player.id, votes: 0 })))
    setIsVotingActive(true)
  }

  const getLivePlayers = () => players.filter(p => !p.killed).length;

  const castVote = (playerId: number, votes: number) => {
    setCurrentVoting(currentVoting.map(vote =>
      vote.playerId === playerId
        ? { ...vote, votes: vote.votes === votes ? 0 : votes }
        : vote
    ))
  }

  const saveVoting = () => {
    setVotingHistory([...votingHistory, currentVoting])
    setCurrentVoting([])
    setIsVotingActive(false)
    setPlayers(players.map(player => ({ ...player, nominated: false })))
  }

  const changeRole = (playerId: number, newRole: Player['role']) => {
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, role: newRole } : player
    ))
  }

  const addFoul = (playerId: number) => {
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, fouls: Math.min(player.fouls + 1, 4) } : player
    ))
  }

  const removeFoul = (playerId: number) => {
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, fouls: Math.max(player.fouls - 1, 0) } : player
    ))
  }

  const getRoleStyles = (role: Player['role']) => {
    switch (role) {
      case 'mafia':
        return 'bg-gray-800 text-white'
      case 'sheriff':
        return 'flex items-center'
      case 'don':
        return 'bg-black text-white flex items-center'
      default:
        return ''
    }
  }



  const shufflePlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled.map((player, index) => ({ ...player, id: index + 1 })));
  }

  const getFoulButtonStyle = (fouls: number) => {
    switch (fouls) {
      case 2:
        return 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800'
      case 3:
        return 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800'
      case 4:
        return 'bg-black hover:bg-gray-800 text-white dark:bg-gray-900 dark:hover:bg-gray-950'
      default:
        return 'bg-white text-black hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
    }
  }

  const updateAdditionalPoints = (playerId: number, points: number) => {
    const clampedPoints = Math.min(Math.max(points, -1), 0.7);
    const roundedPoints = Math.round(clampedPoints * 10) / 10;
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, additionalPoints: roundedPoints } : player
    ))
  }

  const getTimerColor = () => {
    if (timer > 40) return 'text-green-500 dark:text-green-400'
    if (timer > 20) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  const updateNickname = (playerId: number, newNickname: string) => {
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, nickname: newNickname } : player
    ))
  }

  const setWinningTeamAndPoints = (team: 'mafia' | 'city') => {
    setWinningTeam(team);
    const updatedPlayers = players.map(player => {
      let points = 0;
      if (team === 'mafia' && (player.role === 'mafia' || player.role === 'don')) {
        points = 1;
      } else if (team === 'city' && (player.role === 'peaceful' || player.role === 'sheriff')) {
        points = 1;
      }
      return { ...player, points };
    });
    setPlayers(updatedPlayers);
  }

  const saveGame = () => {
    console.log('Saving game...', { judgeName, winningTeam, players })
    // Reset the winning team and judge name after saving
    setWinningTeam(null)
    setJudgeName('')
  }

  const updateBestMove = (index: number, value: number) => {
    const newBestMove = [...bestMove] as [number, number, number];
    newBestMove[index] = value;
    setBestMove(newBestMove);
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sports Mafia Game Panel</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Place</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={shufflePlayers}
                      className="font-semibold"
                    >
                      Nickname <Shuffle className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={distributeRoles}
                      className="font-semibold"
                    >
                      Role <Shuffle className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Fouls</TableHead>
                  <TableHead>Add</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => (
                  <TableRow key={player.id} className={player.killed ? 'opacity-50' : ''}>
                    <TableCell>
                      <Button
                        variant={player.nominated ? "secondary" : "ghost"}
                        onClick={() => nominatePlayer(player.id)}
                        disabled={player.killed}
                        className="w-10 h-10"
                      >
                        {index + 1}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={player.nickname}
                        onChange={(e) => updateNickname(player.id, e.target.value)}
                        className="border-none bg-transparent"
                        disabled={player.killed}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={player.role}
                        onValueChange={(value: Player['role']) => changeRole(player.id, value)}
                      >
                        <SelectTrigger className={`w-[180px] ${getRoleStyles(player.role)}`}>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peaceful">
                            <div className="flex items-center">
                              Peaceful
                              <User className="ml-2 h-4 w-4" />
                            </div>
                          </SelectItem>
                          <SelectItem value="mafia">
                            <div className="flex items-center">
                              Mafia
                              <Axe className="ml-2 h-4 w-4" />
                            </div>
                          </SelectItem>
                          <SelectItem value="don">
                            <div className="flex items-center">
                              Don
                              <CircleDot className="ml-2 h-4 w-4" />
                            </div>
                          </SelectItem>
                          <SelectItem value="sheriff">
                            <div className="flex items-center">
                              Sheriff
                              <Star className="ml-2 h-4 w-4 text-yellow-400" />
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        className={`w-10 h-10 ${getFoulButtonStyle(player.fouls)}`}
                        onClick={() => addFoul(player.id)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          removeFoul(player.id)
                        }}
                        disabled={player.killed}
                      >
                        {player.fouls}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={player.additionalPoints}
                        onChange={(e) => updateAdditionalPoints(player.id, parseFloat(e.target.value))}
                        className="w-20"
                        step="0.1"
                        min="-1"
                        max="0.7"
                        disabled={player.killed}
                      />
                    </TableCell>
                    <TableCell>{player.points}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => killPlayer(player.id)}
                        variant={player.killed ? "outline" : "destructive"}
                      >
                        {'Kill'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Game Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                  ></circle>
                  <circle
                    className={`${getTimerColor()} stroke-current`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    strokeDasharray="276.32"
                    strokeDashoffset={276.32 * (1 - timer / 60)}
                    transform="rotate(-90 50 50)"
                  ></circle>
                  <text
                    x="50"
                    y="50"
                    fontFamily="Verdana"
                    fontSize="32"
                    textAnchor="middle"
                    alignmentBaseline="central"
                    className={getTimerColor()}
                  >
                    {timer}
                  </text>
                </svg>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTimer(60)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full flex space-x-2 items-center">
                <Input
                  placeholder="First Killed"
                  value={firstKilled}
                  onChange={(e) => setFirstKilled(e.target.value)}
                  className="flex-grow"
                  disabled
                />
                {[0, 1, 2].map((index) => (
                  <Input
                    key={index}
                    type="number"
                    value={bestMove[index]}
                    onChange={(e) => updateBestMove(index, parseInt(e.target.value) || 0)}
                    className="w-12 h-10 p-1 text-center"
                    min={0}
                    max={10}
                    disabled={!firstKilled}
                  />
                ))}
              </div>
              <Input
                placeholder="Judge Name"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                className="w-full"
              />
              <div className="flex space-x-2 w-full">
                <Button
                  variant={winningTeam === 'mafia' ? 'default' : 'outline'}
                  onClick={() => setWinningTeamAndPoints('mafia')}
                  className="flex-1"
                >
                  Mafia Win
                </Button>
                <Button
                  variant={winningTeam === 'city' ? 'destructive' : 'outline'}
                  onClick={() => setWinningTeamAndPoints('city')}
                  className="flex-1"
                >
                  City Win
                </Button>
              </div>
              <Button
                onClick={saveGame}
                className="w-full"
                disabled={!winningTeam || !judgeName}
              >
                Save Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Voting</CardTitle>
        </CardHeader>
        <CardContent>
          {isVotingActive && currentVoting.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Votes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVoting.map(vote => (
                    <TableRow key={vote.playerId}>
                      <TableCell>{players.find(p => p.id === vote.playerId)?.nickname}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: getLivePlayers() }, (_, i) => i + 1).map(voteCount => (
                            <Button
                              key={voteCount}
                              variant="outline"
                              size="sm"
                              onClick={() => castVote(vote.playerId, voteCount)}
                              className={vote.votes === voteCount
                                ? "bg-primary text-primary-foreground hover:bg-gray-900 hover:text-white"
                                : "hover:bg-gray-200"
                              }
                            >
                              {voteCount}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={saveVoting} className="mt-4">Save Voting</Button>
            </>
          ) : (
            <p>No active voting. Click on a player&apos;s nickname to nominate.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Voting History</CardTitle>
        </CardHeader>
        <CardContent>
          {votingHistory.map((voting, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">Voting Round {index + 1}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Votes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voting.map(vote => (
                    <TableRow key={vote.playerId}>
                      <TableCell>{players.find(p => p.id === vote.playerId)?.nickname}</TableCell>
                      <TableCell>{vote.votes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}