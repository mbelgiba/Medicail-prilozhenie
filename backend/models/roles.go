package models

const (
	RoleParent = "parent"
	RoleDoctor = "doctor"
	RoleAdmin  = "admin"

	UserStatusActive  = "active"
	UserStatusBlocked = "blocked"
)

var AllowedPublicRoles = map[string]bool{
	RoleParent: true,
	RoleDoctor: true,
}

var RoleLabels = map[string]string{
	RoleParent: "Родитель / представитель",
	RoleDoctor: "Врач / специалист",
	RoleAdmin:  "Администратор",
}

var DevelopmentStatuses = []string{
	"ЗРР",
	"ЗПР",
	"РАС",
	"СДВГ",
	"Норма развития",
	"Наблюдение",
}

var SpecialistTypes = []string{
	"Педиатр",
	"Логопед-дефектолог",
	"Детский невролог",
	"Детский психолог",
	"Реабилитолог",
}
