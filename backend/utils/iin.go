package utils

import "errors"

// ValidateIIN validates a Kazakhstan Individual Identification Number (ИИН РК).
// Rules:
//   - Exactly 12 digits
//   - Digits 1-6 encode birth date (YYMMDD)
//   - Digit 7 encodes century+gender: 1=M 1800s, 2=F 1800s, 3=M 1900s, 4=F 1900s, 5=M 2000s, 6=F 2000s
//   - Digit 12 is a check digit computed via weighted sum algorithm
func ValidateIIN(iin string) error {
	if len(iin) != 12 {
		return errors.New("ИИН должен содержать ровно 12 цифр")
	}

	digits := make([]int, 12)
	for i, ch := range iin {
		if ch < '0' || ch > '9' {
			return errors.New("ИИН должен содержать только цифры")
		}
		digits[i] = int(ch - '0')
	}

	// Validate month (index 2-3)
	month := digits[2]*10 + digits[3]
	if month < 1 || month > 12 {
		return errors.New("некорректный месяц рождения в ИИН")
	}

	// Validate day (index 4-5)
	day := digits[4]*10 + digits[5]
	if day < 1 || day > 31 {
		return errors.New("некорректный день рождения в ИИН")
	}

	// Century-gender digit (index 6) must be 1-6
	cg := digits[6]
	if cg < 1 || cg > 6 {
		return errors.New("некорректный 7-й разряд ИИН (допустимы значения 1–6)")
	}

	// Check digit — weights set 1
	w1 := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}
	sum := 0
	for i := 0; i < 11; i++ {
		sum += digits[i] * w1[i]
	}
	remainder := sum % 11

	// If remainder == 10, use weights set 2
	if remainder == 10 {
		w2 := []int{3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2}
		sum = 0
		for i := 0; i < 11; i++ {
			sum += digits[i] * w2[i]
		}
		remainder = sum % 11
	}

	if remainder != digits[11] {
		return errors.New("контрольный разряд ИИН не совпадает — проверьте корректность номера")
	}

	return nil
}

// ValidateKZIIN is kept for backward compatibility (returns bool)
func ValidateKZIIN(iin string) bool {
	return ValidateIIN(iin) == nil
}

// IINGender returns "male" or "female" based on the century-gender digit
func IINGender(iin string) string {
	if len(iin) < 7 {
		return ""
	}
	cg := int(iin[6] - '0')
	if cg%2 == 1 {
		return "male"
	}
	return "female"
}

// IINCentury returns the birth century range encoded in the IIN
func IINCentury(iin string) string {
	if len(iin) < 7 {
		return ""
	}
	switch int(iin[6] - '0') {
	case 1, 2:
		return "1800–1899"
	case 3, 4:
		return "1900–1999"
	case 5, 6:
		return "2000–2099"
	}
	return ""
}
