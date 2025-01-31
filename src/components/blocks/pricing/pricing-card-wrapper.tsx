"use client"

import { motion } from "motion/react"
import React from "react"

type PricingCardWrapperProps = React.PropsWithChildren<{
  index: number
}>

export const PricingCardWrapper: React.FC<PricingCardWrapperProps> = ({
  children,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      {children}
    </motion.div>
  )
}

export const PricingCardFeatureWrapper: React.FC<PricingCardWrapperProps> = ({
  index,
  children
}) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center space-x-2"
    >
      {children}
    </motion.li>
  )
}
