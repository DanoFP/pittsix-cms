package logger

import (
    "go.uber.org/zap"
)

var Log *zap.SugaredLogger

func Init(env string) {
    var logger *zap.Logger
    if env == "production" {
        logger, _ = zap.NewProduction()
    } else {
        logger, _ = zap.NewDevelopment()
    }
    Log = logger.Sugar()
}