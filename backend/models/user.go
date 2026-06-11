package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID       uint `gorm:"primaryKey" json:"id"`
	Username string             `gorm:"column:username" json:"username"`
	Email    string             `gorm:"column:email;type:varchar(255);uniqueIndex" json:"email,omitempty"`
	Password string             `gorm:"column:password" json:"-"`

	Role   string `gorm:"column:role" json:"role"`
	Status string `gorm:"column:status" json:"status"`
	Phone  string `gorm:"column:phone" json:"phone,omitempty"`

	DoctorCode   string `gorm:"column:doctor_code" json:"doctorCode,omitempty"`
	Specialty    string `gorm:"column:specialty" json:"specialty,omitempty"`
	Organization string `gorm:"column:organization" json:"organization,omitempty"`
	Cabinet      string `gorm:"column:cabinet" json:"cabinet,omitempty"`
	LicenseNo    string `gorm:"column:license_no" json:"licenseNo,omitempty"`

	IIN string `gorm:"column:iin;type:varchar(20);index" json:"iin"`

	ParentID uint `gorm:"column:parent_id" json:"parentId,omitempty"`
	Children []User             `gorm:"-" json:"children,omitempty"`

	BirthDate time.Time `gorm:"column:birth_date" json:"birthDate,omitempty"`
	Gender    string    `gorm:"column:gender" json:"gender,omitempty"`

	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
