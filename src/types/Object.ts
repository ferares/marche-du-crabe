import { type Enemy } from "./Enemy"

export type Object = {
  icon: string
  enemy?: Enemy
  revealed: boolean
}