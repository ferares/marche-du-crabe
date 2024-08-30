"use client"

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { type RichTranslationValues, useTranslations } from "next-intl"

import { useRouter } from "@/navigation"

import { type PlayerBoard, type Board } from "@/types/Board"

import { drawEnemy, enemyIcons, getPlayerBoardData, movePlayer, objectRevealedIcon, placeEnemy, playersIcon, shrimpIcon } from "@/helpers/game"

import BoardComponent from "./Board"
import GameHeader from "./GameHeader"
import Modal from "./Modal"
import Popover from "./Popover"

interface TutorialComponentProps { board: Board }

export default function TutorialComponent({ board }: TutorialComponentProps) {
  const t = useTranslations("Pages.Tutorial")
  const router = useRouter()
  const [tutorialStep, setTutorialStep] = useState(0)
  const [playerBoard, setPlayerBoard] = useState<PlayerBoard>(getPlayerBoardData("barco", 2, false, board))

  useEffect(() => {
    if (tutorialStep === 7) {
      drawEnemy(board)
      setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
    } else if (tutorialStep === 8) {
      placeEnemy(4, 0, board)
      setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
    } else if (tutorialStep === 9) {
      movePlayer(0, 5, board)
      setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
      setTutorialStep((current) => current + 1)
    } else if (tutorialStep === 13) {
      router.push("/")
    }
  }, [tutorialStep, board, router])

  function onDrawCard() {
    if (tutorialStep !== 2) return
    drawEnemy(board)
    setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
    setTutorialStep((current) => current + 1)
  }
  
  function onPlaceEnemy(row: number, column: number) {
    if (tutorialStep !== 3) return
    placeEnemy(row, column, board)
    setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
    setTutorialStep((current) => current + 1)
  }
  
  function onMovePlayers(row: number, column: number) {
    if ((tutorialStep !== 5) || (row !== 0) || (column !== 0)) return
    movePlayer(0, 0, board)
    setPlayerBoard(getPlayerBoardData("barco", 2, false, board))
    setTutorialStep((current) => current + 1)
  }

  const contiuneBtn = useCallback((label = "Continue") => (
    <button type="button" onClick={() => setTutorialStep((current) => current + 1)}>
      {label}
    </button>
  ), [])

  const translationOptions: RichTranslationValues = useMemo(() => ({ p: (chunks: ReactNode) => <p>{chunks}</p> }), [])
  
  return (
    <>
      <GameHeader board={playerBoard} />
      <div className="tutorial-wrapper">
        <div className="tutorial-container">
          <BoardComponent board={playerBoard} onDrawCard={onDrawCard} onGameRestart={() => null} onMovePlayers={onMovePlayers} onPlaceEnemy={onPlaceEnemy} />
          {(tutorialStep < 2 || tutorialStep === 12) && (
            <Modal id="tutorial-modal" labelledBy="tutorial-modal-title" open={true} closeable={false}>
              {tutorialStep === 0 && (
                <div>
                  {t("t1")}
                  {t.rich("m1", { objectRevealedIcon, enemyIcon: enemyIcons.octopus, ...translationOptions })}
                </div>
              )}
              {tutorialStep === 1 && (
                <div>
                  {t("t2")}
                  {t.rich("m2", translationOptions)}
                </div>
              )}
              {tutorialStep === 12 && (
                <div>
                  {t("t2")}
                  {t.rich("m2", translationOptions)}
                </div>
              )}
              {contiuneBtn(tutorialStep === 12 ? "Finish tutorial" : undefined)}
            </Modal>
          )}
          {(tutorialStep === 2) && (
            <div className="tutorial-card tutorial-card--2">
              <Popover open title={t("t3")}>
                {t.rich("m3", translationOptions)}
              </Popover>
            </div>
          )}
          {(tutorialStep === 3) && (
            <div className="tutorial-card tutorial-card--3">
              <Popover open title={t("t4")}>
                {t.rich("m4", translationOptions)}
              </Popover>
            </div>
          )}
          {(tutorialStep === 4) && (
            <div className="tutorial-card tutorial-card--4">
              <Popover open title={t("t5")}>
                {t.rich("m5", translationOptions)}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
          {(tutorialStep === 5) && (
            <div className="tutorial-card tutorial-card--5">
              <Popover open title={t("t6")}>
                {t.rich("m6", { objectIcon: board.cards[0][0].object?.icon, ...translationOptions })}
              </Popover>
            </div>
          )}
          {(tutorialStep === 6) && (
            <div className="tutorial-card tutorial-card--6">
              <Popover open title={t("t7")}>
                {t.rich("m7", { objectIcon: board.cards[0][0].object?.icon, shrimpIcon, playersIcon, ...translationOptions })}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
          {(tutorialStep === 7) && (
            <div className="tutorial-card tutorial-card--7">
              <Popover open title={t("t8")}>
                {t.rich("m8", translationOptions)}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
          {(tutorialStep === 8) && (
            <div className="tutorial-card tutorial-card--8">
              <Popover open title={t("t9")}>
                {t.rich("m9", translationOptions)}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
          {(tutorialStep === 10) && (
            <div className="tutorial-card tutorial-card--10">
              <Popover open title={t("t10")} position="right">
                {t.rich("m10", { objectIcon: board.cards[0][5].object?.icon, objectRevealedIcon, ...translationOptions })}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
          {(tutorialStep === 11) && (
            <div className="tutorial-card tutorial-card--11">
              <Popover open title={t("t11")} position="right">
                {t.rich("m11", { shrimpIcon, ...translationOptions })}
                {contiuneBtn()}
              </Popover>
            </div>
          )}
        </div>
      </div>
    </>
  )
}