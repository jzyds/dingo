package utils

import (
	"bytes"
)

func Truncate(s string, l int, omission string) string {
	if len(s) <= l {
		return s
	}
	var buffer bytes.Buffer
	sl, rl, rs := 0, 0, []rune(s)
	for _, r := range rs {
		rint := int(r)
		if rint < 128 {
			rl = 1
		} else {
			rl = 2
		}

		if sl + rl > l {
			buffer.WriteString(omission)
			break
		}
		sl += rl
		buffer.WriteRune(r)
	}
	return buffer.String()
}
