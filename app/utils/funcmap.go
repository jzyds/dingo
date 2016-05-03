package utils

import "github.com/dinever/golf"

func RegisterFuncMap(app *golf.Application) {
	app.View.FuncMap["DateFormat"] = DateFormat
	app.View.FuncMap["Now"] = Now
	app.View.FuncMap["Html2Str"] = Html2Str
	app.View.FuncMap["FileSize"] = FileSize
}
